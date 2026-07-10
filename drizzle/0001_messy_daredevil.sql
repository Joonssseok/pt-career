CREATE TABLE `educations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`educationName` varchar(200) NOT NULL,
	`organizationName` varchar(200),
	`completionDate` varchar(20),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `educations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`organizationName` varchar(200) NOT NULL,
	`position` varchar(100),
	`startDate` varchar(20),
	`endDate` varchar(20),
	`isCurrent` boolean DEFAULT false,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`licenseName` varchar(200) NOT NULL,
	`issuingOrganization` varchar(200),
	`licenseNumber` varchar(100),
	`acquiredDate` varchar(20),
	`expiryDate` varchar(20),
	`verificationStatus` enum('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
	`evidenceFileUrl` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profileSpecialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`specialtyId` int NOT NULL,
	CONSTRAINT `profileSpecialties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`profession` varchar(50) NOT NULL,
	`headline` varchar(200),
	`introduction` text,
	`profileImageUrl` text,
	`totalExperienceYears` int DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`verificationStatus` enum('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
	`centerName` varchar(200),
	`centerAddress` text,
	`centerPhone` varchar(30),
	`centerWebsite` text,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`region` varchar(50),
	`contactEmail` varchar(320),
	`contactPhone` varchar(30),
	`snsLinks` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int,
	`targetProfileId` int NOT NULL,
	`reason` varchar(50) NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_name_unique` UNIQUE(`name`)
);
