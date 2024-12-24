package main

import (
    "database/sql"
    "encoding/json"
    "log"
    "math/rand"
    "net/http"
    "strings"
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
    TotalClicks     int                    `json:"total_clicks"`
    TotalLinks      int                    `json:"total_links"`
    ClicksPerDomain map[string]int         `json:"clicks_per_domain"`
    LinksPerDomain  map[string]int         `json:"links_per_domain"`
    TopURLs         []TopURL               `json:"top_urls"`
}

type TopURL struct {
    URL        string `json:"url"`
    Clicks     int    `json:"clicks"`
    ShortCode  string `json:"short_code"`
    CreatedAt  string `json:"created_at"`
}

const (
    shortCodeLength = 6
    charset        = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

var (
    db *sql.DB
)

func init() {
    rand.Seed(time.Now().UnixNano())
}

func main() {
    var err error
    db, err = sql.Open("sqlite3", "./urlshortener.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    createTables()

    r := chi.NewRouter()

    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RealIP)
    r.Use(middleware.RequestID)
    r.Use(httprate.LimitByIP(100, 1*time.Minute))
    r.Use(corsMiddleware) // Add the CORS middleware

    r.Post("/shorten", shortenHandler)
    r.Get("/stats", statsHandler)
    r.Get("/{shortCode}", redirectHandler)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
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

func generateShortCode() string {
    code := make([]byte, shortCodeLength)
    for i := range code {
        code[i] = charset[rand.Intn(len(charset))]
    }
    return string(code)
}

func isValidURL(url string) bool {
    return strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://")
}

func shortenHandler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    var req URLRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    if !isValidURL(req.URL) {
        http.Error(w, "Invalid URL format", http.StatusBadRequest)
        return
    }

    var shortCode string
    for {
        shortCode = generateShortCode()
        var exists bool
        err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM urls WHERE short_code = ?)", shortCode).Scan(&exists)
        if err != nil {
            http.Error(w, "Database error", http.StatusInternalServerError)
            return
        }
        if !exists {
            break
        }
    }

    _, err := db.ExecContext(ctx,
        "INSERT INTO urls (short_code, original_url, domain) VALUES (?, ?, ?)",
        shortCode, req.URL, req.Domain)
    if err != nil {
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
    ctx := r.Context()
    shortCode := chi.URLParam(r, "shortCode")

    var originalURL string
    err := db.QueryRowContext(ctx,
        "UPDATE urls SET clicks = clicks + 1 WHERE short_code = ? RETURNING original_url",
        shortCode).Scan(&originalURL)

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
    ctx := r.Context()
    
    stats := Stats{
        ClicksPerDomain: make(map[string]int),
        LinksPerDomain:  make(map[string]int),
    }

    err := db.QueryRowContext(ctx,
        "SELECT COUNT(*), SUM(clicks) FROM urls").
        Scan(&stats.TotalLinks, &stats.TotalClicks)
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    rows, err := db.QueryContext(ctx,
        "SELECT domain, SUM(clicks) FROM urls GROUP BY domain")
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var domain string
        var clicks int
        if err := rows.Scan(&domain, &clicks); err != nil {
            http.Error(w, "Database error", http.StatusInternalServerError)
            return
        }
        stats.ClicksPerDomain[domain] = clicks
    }

    rows, err = db.QueryContext(ctx,
        "SELECT domain, COUNT(*) FROM urls GROUP BY domain")
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var domain string
        var count int
        if err := rows.Scan(&domain, &count); err != nil {
            http.Error(w, "Database error", http.StatusInternalServerError)
            return
        }
        stats.LinksPerDomain[domain] = count
    }

    rows, err = db.QueryContext(ctx,
        `SELECT original_url, clicks, short_code, created_at 
         FROM urls 
         ORDER BY clicks DESC 
         LIMIT 10`)
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