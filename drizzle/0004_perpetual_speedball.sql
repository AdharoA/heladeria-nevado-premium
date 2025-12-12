ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('bank_transfer','cash_on_delivery','yape','plin','paypal') NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `images` json;--> statement-breakpoint
ALTER TABLE `posts` ADD `layout` enum('carousel','side_by_side','collage') DEFAULT 'carousel' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `image`;