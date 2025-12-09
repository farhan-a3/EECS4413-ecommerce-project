-- CreateTable
CREATE TABLE "products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rating" JSONB
);
