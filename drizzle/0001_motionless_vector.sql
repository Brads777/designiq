CREATE TABLE `chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(500),
	`content` text,
	`wordCount` int,
	`useDropCap` boolean DEFAULT true,
	`customStyles` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `copyrightPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`isbn` varchar(20),
	`publisherName` varchar(255),
	`publishYear` int,
	`copyrightHolder` varchar(255),
	`legalText` text,
	`additionalCredits` text,
	`customContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `copyrightPages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `covers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`paperType` enum('white','cream','color') NOT NULL DEFAULT 'cream',
	`trimWidth` decimal(5,2) NOT NULL,
	`trimHeight` decimal(5,2) NOT NULL,
	`pageCount` int NOT NULL,
	`spineWidth` decimal(5,3),
	`frontCoverUrl` text,
	`backCoverUrl` text,
	`spineText` varchar(255),
	`designData` json,
	`fullCoverUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `covers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exportJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`exportType` enum('idml','pdf','both') NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`idmlFileUrl` text,
	`pdfFileUrl` text,
	`errorMessage` text,
	`processingStartedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exportJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255),
	`status` enum('draft','processing','ready','exported') NOT NULL DEFAULT 'draft',
	`sourceFileUrl` text,
	`sourceFileName` varchar(255),
	`pageCount` int,
	`chapterCount` int,
	`wordCount` int,
	`themeId` varchar(64),
	`customStyles` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `styleMappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`sourceStyleName` varchar(255) NOT NULL,
	`sourceStyleType` enum('paragraph','character') NOT NULL,
	`targetStyleName` varchar(255) NOT NULL,
	`isAccepted` boolean DEFAULT false,
	`isAutoDetected` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `styleMappings_id` PRIMARY KEY(`id`)
);
