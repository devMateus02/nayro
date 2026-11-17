-- A galeria de imagens dá lugar a um vídeo por projeto
ALTER TABLE "projects" DROP COLUMN "gallery";
ALTER TABLE "projects" ADD COLUMN "video" TEXT;
