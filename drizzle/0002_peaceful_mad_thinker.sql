ALTER TABLE `specialties` DROP INDEX `specialties_name_unique`;--> statement-breakpoint
ALTER TABLE `specialties` MODIFY COLUMN `category` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `profileSpecialties` ADD `isPrimary` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `profileSpecialties` ADD `displayOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `specialties` ADD `description` text;--> statement-breakpoint
ALTER TABLE `specialties` ADD `displayOrder` int DEFAULT 0 NOT NULL;