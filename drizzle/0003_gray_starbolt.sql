CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('bug','feature','general','support') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`pageUrl` varchar(500),
	`browserInfo` text,
	`status` enum('new','reviewed','resolved','closed') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`marketingEmails` boolean NOT NULL DEFAULT false,
	`defaultTheme` varchar(64) DEFAULT 'classic-fiction',
	`defaultPaperType` enum('white','cream','color') DEFAULT 'cream',
	`defaultTrimSize` varchar(20) DEFAULT '6x9',
	`showTutorialTips` boolean NOT NULL DEFAULT true,
	`compactView` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `hasAcceptedTos` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tosAcceptedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `hasCompletedOnboarding` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingStep` int DEFAULT 0 NOT NULL;