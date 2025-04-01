package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
	_ "github.com/mattn/go-sqlite3"
)

type URLRequest struct {
	URL    string `json:"url"`
	Domain string `json:"domain"`
}

type URLResponse struct {
	ShortCode string `json:"shortCode"`
	ShortURL  string `json:"shortUrl"`
}

type Stats struct {
	TotalClicks     int            `json:"totalClicks"`
	TotalLinks      int            `json:"totalLinks"`
	ClicksPerDomain map[string]int `json:"clicksPerDomain"`
	LinksPerDomain  map[string]int `json:"linksPerDomain"`
	TopURLs         []TopURL       `json:"topUrls"`
}

type TopURL struct {
	URL       string `json:"url"`
	Clicks    int    `json:"clicks"`
	ShortCode string `json:"shortCode"`
	CreatedAt string `json:"createdAt"`
}

type HealthResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	TotalLinks  int    `json:"totalLinks"`
	TotalClicks int    `json:"totalClicks"`
}

const (
	shortCodeLength = 6
	charset         = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

var (
	db *sql.DB

	stmtCheckShortCode *sql.Stmt
	stmtInsertURL      *sql.Stmt
	stmtUpdateClicks   *sql.Stmt
	stmtGetStats       *sql.Stmt
	stmtGetDomainStats *sql.Stmt
	stmtGetTopURLs     *sql.Stmt
	stmtGetTotalClicks *sql.Stmt // New prepared statement
	stmtGetTotalLinks  *sql.Stmt // New prepared statement
)

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./urlshortener.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	createTables()

	if err := initPreparedStatements(); err != nil {
		log.Fatalf("Failed to prepare statements: %v", err)
	}
	defer closePreparedStatements()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(middleware.RequestID)
	r.Use(middleware.Compress(5))
	r.Use(httprate.LimitByIP(100, 1*time.Minute))
	r.Use(corsMiddleware)

	fs := http.FileServer(http.Dir("./static"))
	r.Handle("/*", http.StripPrefix("/", fs))

	shortenRateLimit := httprate.LimitByIP(10, 1*time.Minute)
	r.With(shortenRateLimit).Post("/shorten", shortenHandler)

	r.Get("/stats", statsHandler)
	r.Get("/{shortCode}", redirectHandler)
	r.Get("/health", healthHandler)
	r.Get("/", rootRedirectHandler)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Println("Server shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}

func logError(handler string, err error) {
	log.Printf("[ERROR] %s: %v", handler, err)
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_code TEXT UNIQUE NOT NULL,
            original_url TEXT NOT NULL,
            domain TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            clicks INTEGER DEFAULT 0
        )`,
		`CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code)`,
		`CREATE INDEX IF NOT EXISTS idx_domain ON urls(domain)`,
	}

	for _, query := range queries {
		_, err := db.Exec(query)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func initPreparedStatements() error {
	var err error

	stmtCheckShortCode, err = db.Prepare("SELECT EXISTS(SELECT 1 FROM urls WHERE short_code = ?)")
	if err != nil {
		return err
	}

	stmtInsertURL, err = db.Prepare("INSERT INTO urls (short_code, original_url, domain) VALUES (?, ?, ?)")
	if err != nil {
		return err
	}

	stmtUpdateClicks, err = db.Prepare("UPDATE urls SET clicks = clicks + 1 WHERE short_code = ? RETURNING original_url")
	if err != nil {
		return err
	}

	stmtGetStats, err = db.Prepare(`
        SELECT COUNT(*), COALESCE(SUM(clicks), 0) FROM urls
    `)
	if err != nil {
		return err
	}

	stmtGetDomainStats, err = db.Prepare(`
        SELECT domain, SUM(clicks) as total_clicks, COUNT(*) as total_links
        FROM urls GROUP BY domain
    `)
	if err != nil {
		return err
	}

	stmtGetTopURLs, err = db.Prepare(`
        SELECT original_url, clicks, short_code, created_at
        FROM urls ORDER BY clicks DESC LIMIT 3
    `)
	if err != nil {
		return err
	}

	stmtGetTotalClicks, err = db.Prepare("SELECT COALESCE(SUM(clicks), 0) FROM urls")
	if err != nil {
		return err
	}

	stmtGetTotalLinks, err = db.Prepare("SELECT COUNT(*) FROM urls")
	if err != nil {
		return err
	}

	return nil
}

func closePreparedStatements() {
	if stmtCheckShortCode != nil {
		stmtCheckShortCode.Close()
	}
	if stmtInsertURL != nil {
		stmtInsertURL.Close()
	}
	if stmtUpdateClicks != nil {
		stmtUpdateClicks.Close()
	}
	if stmtGetStats != nil {
		stmtGetStats.Close()
	}
	if stmtGetDomainStats != nil {
		stmtGetDomainStats.Close()
	}
	if stmtGetTopURLs != nil {
		stmtGetTopURLs.Close()
	}
	if stmtGetTotalClicks != nil {
		stmtGetTotalClicks.Close()
	}
	if stmtGetTotalLinks != nil {
		stmtGetTotalLinks.Close()
	}
}

func generateShortCode() (string, error) {
	code := make([]byte, shortCodeLength)
	for i := range code {
		randomIndex, err := rand.Int(rand.Reader,
			new(big.Int).SetInt64(int64(len(charset))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random number: %w", err)
		}
		code[i] = charset[randomIndex.Int64()]
	}
	return string(code), nil
}

func isValidURL(url string) bool {
	return strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://")
}

func shortenHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	var req URLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logError("shortenHandler/decode", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if !isValidURL(req.URL) {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		logError("shortenHandler/transaction", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	var shortCode string
	for {
		shortCode, err = generateShortCode()
		if err != nil {
			logError("shortenHandler/generateShortCode", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		var exists bool
		err = tx.StmtContext(ctx, stmtCheckShortCode).QueryRowContext(ctx, shortCode).Scan(&exists)
		if err != nil {
			logError("shortenHandler/checkShortCode", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if !exists {
			break
		}
	}

	_, err = tx.StmtContext(ctx, stmtInsertURL).ExecContext(ctx, shortCode, req.URL, req.Domain)
	if err != nil {
		logError("shortenHandler/insertURL", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if err = tx.Commit(); err != nil {
		logError("shortenHandler/commit", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	response := URLResponse{
		ShortCode: shortCode,
		ShortURL:  "https://" + req.Domain + "/" + shortCode,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	shortCode := chi.URLParam(r, "shortCode")

	var originalURL string
	err := stmtUpdateClicks.QueryRowContext(ctx, shortCode).Scan(&originalURL)

	if err == sql.ErrNoRows {
		http.Error(w, "Short URL not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, originalURL, http.StatusMovedPermanently)
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	stats := Stats{
		ClicksPerDomain: make(map[string]int),
		LinksPerDomain:  make(map[string]int),
	}

	err := db.QueryRowContext(ctx,
		`SELECT
            COUNT(*),
            COALESCE(SUM(clicks), 0)
        FROM urls`).
		Scan(&stats.TotalLinks, &stats.TotalClicks)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	rows, err := db.QueryContext(ctx,
		`SELECT
            domain,
            SUM(clicks) as total_clicks,
            COUNT(*) as total_links
        FROM urls
        GROUP BY domain`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var domain string
		var clicks, count int
		if err := rows.Scan(&domain, &clicks, &count); err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		stats.ClicksPerDomain[domain] = clicks
		stats.LinksPerDomain[domain] = count
	}

	rows, err = db.QueryContext(ctx,
		`SELECT original_url, clicks, short_code, created_at
         FROM urls
         ORDER BY clicks DESC
         LIMIT 3`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var url TopURL
		if err := rows.Scan(&url.URL, &url.Clicks, &url.ShortCode, &url.CreatedAt); err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		stats.TopURLs = append(stats.TopURLs, url)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=60")
	json.NewEncoder(w).Encode(stats)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func rootRedirectHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://anon.love", http.StatusMovedPermanently)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var totalLinks int
	err := stmtGetTotalLinks.QueryRowContext(ctx).Scan(&totalLinks)
	if err != nil {
		logError("healthHandler/getTotalLinks", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	var totalClicks int
	err = stmtGetTotalClicks.QueryRowContext(ctx).Scan(&totalClicks)
	if err != nil {
		logError("healthHandler/getTotalClicks", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	healthResponse := HealthResponse{
		Status:      "OK",
		Timestamp:   time.Now().UTC().String(),
		TotalLinks:  totalLinks,
		TotalClicks: totalClicks,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(healthResponse)
}
