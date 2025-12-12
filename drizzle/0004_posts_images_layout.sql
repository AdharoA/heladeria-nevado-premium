-- Migration to add images and layout columns to posts table
ALTER TABLE `posts` ADD COLUMN `images` json;
ALTER TABLE `posts` ADD COLUMN `layout` enum('carousel','side_by_side','collage') NOT NULL DEFAULT 'carousel';
ALTER TABLE `posts` DROP COLUMN `image`;
