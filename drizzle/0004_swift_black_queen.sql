CREATE TABLE `chapterImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`originalFileName` varchar(255),
	`placementType` enum('inline','float-left','float-right','full-width','full-bleed','background') NOT NULL,
	`positionMarker` varchar(100),
	`orderIndex` int DEFAULT 0,
	`widthPercent` int DEFAULT 100,
	`aspectRatio` varchar(20),
	`caption` text,
	`captionPosition` enum('below','above','overlay') DEFAULT 'below',
	`overlayData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chapterImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chapterTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` enum('intro','body','graphic-novel','custom') NOT NULL,
	`layoutType` enum('text-only','text-with-images','full-bleed-image','image-grid','decorative-intro','minimal-intro') NOT NULL,
	`settings` json,
	`previewImageUrl` text,
	`isSystem` boolean NOT NULL DEFAULT false,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chapterTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `graphicNovelPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`layoutType` enum('single-image','two-panel-h','two-panel-v','three-panel','four-panel-grid','six-panel-grid','custom') NOT NULL,
	`panelConfig` json,
	`useBleed` boolean NOT NULL DEFAULT true,
	`bleedSize` varchar(20) DEFAULT '0.125in',
	`backgroundColor` varchar(20),
	`backgroundImageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `graphicNovelPages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `graphicNovelPanels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`panelIndex` int NOT NULL,
	`imageUrl` text,
	`positionX` decimal(5,2) DEFAULT '0',
	`positionY` decimal(5,2) DEFAULT '0',
	`width` decimal(5,2) DEFAULT '100',
	`height` decimal(5,2) DEFAULT '100',
	`borderWidth` varchar(20) DEFAULT '2px',
	`borderColor` varchar(20) DEFAULT '#000000',
	`borderRadius` varchar(20) DEFAULT '0',
	`gutterRight` varchar(20) DEFAULT '0.1in',
	`gutterBottom` varchar(20) DEFAULT '0.1in',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `graphicNovelPanels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pageHeaderFooters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`headerEnabled` boolean NOT NULL DEFAULT true,
	`headerLeftContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'book-title',
	`headerCenterContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'none',
	`headerRightContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'page-number',
	`headerCustomLeft` varchar(255),
	`headerCustomCenter` varchar(255),
	`headerCustomRight` varchar(255),
	`footerEnabled` boolean NOT NULL DEFAULT true,
	`footerLeftContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'none',
	`footerCenterContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'page-number',
	`footerRightContent` enum('none','page-number','book-title','chapter-title','author','custom') DEFAULT 'none',
	`footerCustomLeft` varchar(255),
	`footerCustomCenter` varchar(255),
	`footerCustomRight` varchar(255),
	`useDifferentOddEven` boolean NOT NULL DEFAULT true,
	`mirrorOnEvenPages` boolean NOT NULL DEFAULT true,
	`suppressOnChapterFirst` boolean NOT NULL DEFAULT true,
	`headerFont` varchar(100) DEFAULT 'inherit',
	`headerFontSize` varchar(20) DEFAULT '10pt',
	`footerFont` varchar(100) DEFAULT 'inherit',
	`footerFontSize` varchar(20) DEFAULT '10pt',
	`pageNumberStyle` enum('arabic','roman-lower','roman-upper','alpha-lower','alpha-upper') DEFAULT 'arabic',
	`pageNumberPrefix` varchar(20),
	`pageNumberSuffix` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pageHeaderFooters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speechBubbles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`panelId` int NOT NULL,
	`bubbleType` enum('speech','thought','shout','whisper','narration','caption') NOT NULL,
	`text` text NOT NULL,
	`positionX` decimal(5,2) NOT NULL,
	`positionY` decimal(5,2) NOT NULL,
	`width` decimal(5,2) DEFAULT '30',
	`tailDirection` enum('none','top','bottom','left','right','top-left','top-right','bottom-left','bottom-right') DEFAULT 'bottom',
	`backgroundColor` varchar(20) DEFAULT '#FFFFFF',
	`textColor` varchar(20) DEFAULT '#000000',
	`fontSize` varchar(20) DEFAULT '12pt',
	`fontFamily` varchar(100) DEFAULT 'Comic Sans MS, cursive',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speechBubbles_id` PRIMARY KEY(`id`)
);
