#!/bin/bash

# Script para probar la configuración SSL
echo "Probando configuración SSL para dolardehoy.app..."

echo ""
echo "1. Probando conexión HTTP (debería redirigir a HTTPS):"
curl -I http://dolardehoy.app 2>/dev/null | head -5

echo ""
echo "2. Probando conexión HTTPS:"
curl -I https://dolardehoy.app 2>/dev/null | head -5

echo ""
echo "3. Verificando certificado SSL:"
openssl s_client -connect dolardehoy.app:443 -servername dolardehoy.app < /dev/null 2>/dev/null | openssl x509 -noout -dates

echo ""
echo "4. Probando endpoint de salud:"
curl -s https://dolardehoy.app/api/health | jq '.' 2>/dev/null || echo "Endpoint de salud no disponible o respuesta no es JSON"

echo ""
echo "Pruebas completadas!"
