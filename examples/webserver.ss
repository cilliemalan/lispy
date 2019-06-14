(define http (import "http"))
(define fs (import "fs"))

; define a new server
(define server
    ((-> http "createServer")
        (lambda (req res) 
            ((-> res "writeHead") 200 (object (["Content-Type" "text/html"])))
            ((-> res "end") ((-> fs "readFileSync") "index.html"))
        )))

; listen on port 4000
((-> server "listen") 4000)
(print "listening on port 4000")