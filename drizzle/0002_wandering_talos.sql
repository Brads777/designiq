ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('none','active','canceled','past_due','lifetime') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('none','monthly','annual','lifetime') DEFAULT 'none' NOT NULL;