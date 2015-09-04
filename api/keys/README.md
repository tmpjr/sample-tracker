Generate key on most Li(u)nix platforms with:
```
$ openssl genrsa -out jwt-private.pem 2048
$ openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
$ chmod 600 jwt-private.pem jwt-public.pem 
```
