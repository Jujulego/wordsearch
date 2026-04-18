-- CreateTable
CREATE TABLE "Word" (
    "word" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("word")
);

-- CreateIndex
CREATE INDEX "Word_word_idx" ON "Word" USING GIN ("word" gin_trgm_ops);
