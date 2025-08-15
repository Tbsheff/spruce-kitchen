CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"resourceId" text,
	"details" jsonb,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"plan_type" text NOT NULL,
	"billing_type" text NOT NULL,
	"delivery_frequency" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"meal_plan_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"delivery_date" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permission_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_record" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"action" text NOT NULL,
	"windowStart" timestamp NOT NULL,
	"requestCount" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"permissionId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan" ADD CONSTRAINT "meal_plan_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_meal_plan_id_meal_plan_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_permission_id_fk" FOREIGN KEY ("permissionId") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_log_userId" ON "audit_log" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_audit_log_resource" ON "audit_log" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_audit_log_createdAt" ON "audit_log" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_rate_limit_identifier_action" ON "rate_limit_record" USING btree ("identifier","action");--> statement-breakpoint
CREATE INDEX "idx_rate_limit_window_start" ON "rate_limit_record" USING btree ("windowStart");--> statement-breakpoint
CREATE INDEX "idx_role_permission_role" ON "role_permission" USING btree ("role");--> statement-breakpoint
CREATE INDEX "role_permission_role_permissionId_unique" ON "role_permission" USING btree ("role","permissionId");--> statement-breakpoint
CREATE INDEX "idx_user_role" ON "user" USING btree ("role");
