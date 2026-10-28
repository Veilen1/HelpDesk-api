cd C:\Users\Veile\OneDrive\Documentos\proyectos\nestJsCv
npx prisma migrate make init --create-only 2>&1 | find "Migrations" || echo "Already migrated or error"