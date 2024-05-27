
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA IF NOT EXISTS "drizzle";

ALTER SCHEMA "drizzle" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."feature" AS ENUM (
    'upload_videos',
    'link_youtube_accounts'
);

ALTER TYPE "public"."feature" OWNER TO "postgres";

CREATE TYPE "public"."file_origin" AS ENUM (
    'PlayportalBackend',
    'UserProvided'
);

ALTER TYPE "public"."file_origin" OWNER TO "postgres";

CREATE TYPE "public"."file_type" AS ENUM (
    'Video',
    'Audio',
    'Image'
);

ALTER TYPE "public"."file_type" OWNER TO "postgres";

CREATE TYPE "public"."kit_type" AS ENUM (
    'drum-kit',
    'midi-kit',
    'loop-kit',
    'preset-kit',
    'other'
);

ALTER TYPE "public"."kit_type" OWNER TO "postgres";

CREATE TYPE "public"."operation_and_transaction_ids" AS (
	"operation_id" "uuid",
	"transaction_id" "uuid"
);

ALTER TYPE "public"."operation_and_transaction_ids" OWNER TO "postgres";

CREATE TYPE "public"."operation_logs_enum" AS ENUM (
    'cv_unexpected_error',
    'cv_dl_input_success',
    'cv_dl_input_fail',
    'cv_render_success',
    'cv_render_fail',
    'cv_output_to_s3_success',
    'cv_output_to_s3_fail',
    'uv_auth_success',
    'uv_auth_fail',
    'uv_unexpected_error',
    'uv_dl_input_success',
    'uv_dl_input_fail',
    'uv_upload_success',
    'uv_upload_fail'
);

ALTER TYPE "public"."operation_logs_enum" OWNER TO "postgres";

CREATE TYPE "public"."operation_status" AS ENUM (
    'Ongoing',
    'Failed',
    'Completed'
);

ALTER TYPE "public"."operation_status" OWNER TO "postgres";

CREATE TYPE "public"."pricing_plan_interval" AS ENUM (
    'day',
    'week',
    'month',
    'year'
);

ALTER TYPE "public"."pricing_plan_interval" OWNER TO "postgres";

CREATE TYPE "public"."pricing_type" AS ENUM (
    'one_time',
    'recurring'
);

ALTER TYPE "public"."pricing_type" OWNER TO "postgres";

CREATE TYPE "public"."service_enum" AS ENUM (
    'YouTube'
);

ALTER TYPE "public"."service_enum" OWNER TO "postgres";

CREATE TYPE "public"."subscription_status" AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);

ALTER TYPE "public"."subscription_status" OWNER TO "postgres";

CREATE TYPE "public"."transaction_type" AS ENUM (
    'CreateVideo',
    'UploadYoutubeVideo'
);

ALTER TYPE "public"."transaction_type" OWNER TO "postgres";

CREATE TYPE "public"."upload_platform" AS ENUM (
    'YouTube'
);

ALTER TYPE "public"."upload_platform" OWNER TO "postgres";

CREATE TYPE "public"."upload_video_status" AS ENUM (
    'Pending',
    'Uploading',
    'Completed',
    'Failed'
);

ALTER TYPE "public"."upload_video_status" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_operation_and_transaction"("user_id" "uuid", "video_title" "text") RETURNS "public"."operation_and_transaction_ids"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  op_id uuid;
  trans_id uuid;
begin
  INSERT INTO public.transactions (user_id, type)
  VALUES (user_id, 'CreateVideo')
  RETURNING id INTO trans_id;

 
  -- Create operation document
  INSERT INTO public.operations (video_title, user_id)
  VALUES (video_title, user_id)
  RETURNING id INTO op_id;

  RETURN (op_id, trans_id);
END;
$$;

ALTER FUNCTION "public"."create_operation_and_transaction"("user_id" "uuid", "video_title" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_upload_video_operation"("user_id" "uuid", "created_from_operation_id" "uuid", "using_oauth_creds_id" "uuid", "metadata" "jsonb") RETURNS TABLE("upload_op_id" "uuid", "trans_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    trans_id UUID;
    upload_op_id UUID;
BEGIN
    -- Create transaction record
    INSERT INTO public.transactions (user_id, type)
    VALUES (user_id, 'UploadYoutubeVideo')
    RETURNING id INTO trans_id;

    -- Create operation document
    INSERT INTO public.upload_video_operations (create_operation_id, upload_platform, oauth_creds_id, metadata)
    VALUES (created_from_operation_id, 'YouTube', using_oauth_creds_id, metadata)
    RETURNING id INTO upload_op_id;

    RETURN QUERY SELECT upload_op_id, trans_id;
END;
$$;

ALTER FUNCTION "public"."create_upload_video_operation"("user_id" "uuid", "created_from_operation_id" "uuid", "using_oauth_creds_id" "uuid", "metadata" "jsonb") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_all_operation_data"("operation_to_delete_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE from public.operation_logs where operation_id = operation_to_delete_id;
  DELETE from public.file_metadata where operation_id = operation_to_delete_id;
  
  SELECT COUNT(*) INTO deleted_count FROM public.operations WHERE id = operation_to_delete_id;
  
  DELETE from public.operations where id = operation_to_delete_id;

  RETURN deleted_count;
END;
$$;

ALTER FUNCTION "public"."delete_all_operation_data"("operation_to_delete_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."gen_id"() RETURNS "uuid"
    LANGUAGE "sql"
    AS $$
  select extensions.uuid_generate_v4();
$$;

ALTER FUNCTION "public"."gen_id"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_quota_limits"("user_id" "uuid") RETURNS TABLE("role_id" "text", "create_video_daily_quota" integer, "file_size_limit_mb" integer, "upload_youtube_daily_quota" integer)
    LANGUAGE "plpgsql"
    AS $_$
DECLARE user_id_alias ALIAS for $1;
BEGIN
  RETURN QUERY
  SELECT
    public.roles.id,
    public.roles.create_video_daily_quota,
    public.roles.file_size_limit_mb,
    public.roles.upload_youtube_daily_quota
  FROM
    public.user_roles 
    JOIN public.roles ON public.user_roles.granted_role = public.roles.id
  WHERE
    public.user_roles.user_id = user_id_alias;
END;
$_$;

ALTER FUNCTION "public"."get_user_quota_limits"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_quota_usage_daily_create_video"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $_$
DECLARE 
net_transactions INTEGER;
user_id_alias ALIAS FOR $1;
BEGIN
SELECT
  COUNT(DISTINCT public.transactions.id) - COUNT(DISTINCT public.transaction_refunds.refund_for)
  INTO net_transactions
FROM
  public.transactions
  LEFT JOIN public.transaction_refunds ON public.transactions.id = public.transaction_refunds.refund_for
WHERE
  public.transactions.type = 'CreateVideo'
  AND public.transactions.user_id = user_id_alias
  AND public.transactions.created_at > current_date;
RETURN net_transactions;
END;
$_$;

ALTER FUNCTION "public"."get_user_quota_usage_daily_create_video"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_quota_usage_daily_upload_youtube_video"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $_$
DECLARE 
net_transactions INTEGER;
user_id_alias ALIAS FOR $1;
BEGIN
SELECT
  COUNT(DISTINCT public.transactions.id) - COUNT(DISTINCT public.transaction_refunds.refund_for)
  INTO net_transactions
FROM
  public.transactions
  LEFT JOIN public.transaction_refunds ON public.transactions.id = public.transaction_refunds.refund_for
WHERE
  public.transactions.type = 'UploadYoutubeVideo'
  AND public.transactions.user_id = user_id_alias
  AND public.transactions.created_at > current_date;
RETURN net_transactions;
END;
$_$;

ALTER FUNCTION "public"."get_user_quota_usage_daily_upload_youtube_video"("user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_failed_operation_refund"("operation_id" "uuid", "transaction_to_refund_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    UPDATE public.operations
    SET status = 'Failed'
    WHERE id = operation_id;

    -- Create transaction refund record
    INSERT INTO public.transaction_refunds (refund_for)
    VALUES (transaction_to_refund_id);
END;
$$;

ALTER FUNCTION "public"."handle_failed_operation_refund"("operation_id" "uuid", "transaction_to_refund_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_failed_upload_video_operation_refund"("upload_video_operation_id" "uuid", "transaction_id_to_refund" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    UPDATE public.upload_video_operations
    SET status = 'Failed'
    WHERE id = upload_video_operation_id;

    -- Create transaction refund record
    INSERT INTO public.transaction_refunds (refund_for)
    VALUES (transaction_id_to_refund);
END;$$;

ALTER FUNCTION "public"."handle_failed_upload_video_operation_refund"("upload_video_operation_id" "uuid", "transaction_id_to_refund" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    INSERT INTO public.user_data (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);

ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";

CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" NOT NULL,
    "stripe_customer_id" "text" NOT NULL
);

ALTER TABLE "public"."customers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "id" bigint NOT NULL,
    "feature" "public"."feature" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "description" "text"
);

ALTER TABLE "public"."feature_flags" OWNER TO "postgres";

ALTER TABLE "public"."feature_flags" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."feature_flags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."file_metadata" (
    "s3_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "operation_id" "uuid",
    "file_type" "public"."file_type" NOT NULL,
    "file_origin" "public"."file_origin" NOT NULL
);

ALTER TABLE "public"."file_metadata" OWNER TO "postgres";

COMMENT ON COLUMN "public"."file_metadata"."file_type" IS 'What type of item is located here in s3';

COMMENT ON COLUMN "public"."file_metadata"."file_origin" IS 'Did a user upload this file, or did we generate it on our backend';

CREATE TABLE IF NOT EXISTS "public"."kits" (
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."kit_type" NOT NULL,
    "image_url" "text",
    "description" "text",
    "download_url" "text" NOT NULL
);

ALTER TABLE "public"."kits" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."oauth_creds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "service_name" "public"."service_enum" NOT NULL,
    "service_account_id" "text" NOT NULL,
    "service_account_name" "text",
    "service_account_image_url" "text",
    "refresh_token" "text"
);

ALTER TABLE "public"."oauth_creds" OWNER TO "postgres";

COMMENT ON COLUMN "public"."oauth_creds"."service_account_id" IS 'The unique identifier the platform uses (so we don''t store multiple credentials for the same account)';

CREATE TABLE IF NOT EXISTS "public"."operation_logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "message" "text",
    "operation_id" "uuid"
);

ALTER TABLE "public"."operation_logs" OWNER TO "postgres";

ALTER TABLE "public"."operation_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."operation_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."operations" (
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" "public"."operation_status" DEFAULT 'Ongoing'::"public"."operation_status",
    "video_title" "text" DEFAULT 'My video'::"text" NOT NULL,
    "operation_duration" integer,
    CONSTRAINT "operations_video_title_check" CHECK (("length"("video_title") < 500))
);

ALTER TABLE "public"."operations" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."operations_filemetadata" WITH ("security_invoker"='on') AS
 SELECT "operations"."user_id",
    "operations"."id" AS "operation_id",
    "file_metadata"."s3_key",
    "file_metadata"."file_origin",
    "file_metadata"."file_type",
    "operations"."created_at",
    "operations"."status",
    "operations"."video_title",
    "operations"."operation_duration"
   FROM ("public"."file_metadata"
     FULL JOIN "public"."operations" ON (("file_metadata"."operation_id" = "operations"."id")));

ALTER TABLE "public"."operations_filemetadata" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."prices" (
    "id" "text" NOT NULL,
    "product_id" "text",
    "active" boolean,
    "description" "text",
    "unit_amount" bigint,
    "currency" "text",
    "type" "public"."pricing_type",
    "interval" "public"."pricing_plan_interval",
    "interval_count" integer,
    "trial_period_days" integer,
    "metadata" "jsonb",
    CONSTRAINT "prices_currency_check" CHECK (("char_length"("currency") = 3))
);

ALTER TABLE "public"."prices" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "text" NOT NULL,
    "active" boolean,
    "name" "text",
    "description" "text",
    "image" "text",
    "metadata" "jsonb"
);

ALTER TABLE "public"."products" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "text" NOT NULL,
    "create_video_daily_quota" integer NOT NULL,
    "file_size_limit_mb" integer NOT NULL,
    "for_plan" "text",
    "upload_youtube_daily_quota" integer DEFAULT 5 NOT NULL
);

ALTER TABLE "public"."roles" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."products_prices" WITH ("security_invoker"='on') AS
 SELECT "products"."id" AS "product_id",
    "products"."active" AS "product_active",
    "products"."description",
    "products"."image",
    "products"."metadata",
    "products"."name",
    "prices"."id" AS "price_id",
    "prices"."active" AS "price_active",
    "prices"."currency",
    "prices"."unit_amount",
    "prices"."interval",
    "prices"."interval_count",
    "prices"."metadata" AS "price_metadata",
    "prices"."trial_period_days",
    "prices"."type" AS "price_type",
    "roles"."create_video_daily_quota",
    "roles"."file_size_limit_mb"
   FROM (("public"."prices"
     JOIN "public"."products" ON (("prices"."product_id" = "products"."id")))
     JOIN "public"."roles" ON (("products"."id" = "roles"."for_plan")))
  WHERE (("prices"."active" = true) AND ("prices"."id" IS NOT NULL));

ALTER TABLE "public"."products_prices" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."subscription_status",
    "metadata" "jsonb",
    "price_id" "text",
    "quantity" integer,
    "cancel_at_period_end" boolean,
    "created" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "ended_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "cancel_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "canceled_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);

ALTER TABLE "public"."subscriptions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."transaction_refunds" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "refund_for" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."transaction_refunds" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "user_id" "uuid",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."transaction_type" DEFAULT 'CreateVideo'::"public"."transaction_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."transactions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."upload_video_operations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "create_operation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "public"."upload_video_status" DEFAULT 'Pending'::"public"."upload_video_status" NOT NULL,
    "upload_platform" "public"."upload_platform" NOT NULL,
    "metadata" "jsonb",
    "oauth_creds_id" "uuid"
);

ALTER TABLE "public"."upload_video_operations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_data" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "billing_address" "jsonb",
    "payment_method" "jsonb"
);

ALTER TABLE "public"."user_data" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature_flag_id" bigint NOT NULL,
    "user_id" "uuid",
    "enabled" boolean NOT NULL
);

ALTER TABLE "public"."user_feature_flags" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."user_feature_flags_view" AS
 SELECT "user_feature_flags"."user_id",
    "feature_flags"."feature",
    "feature_flags"."enabled" AS "feature_enabled",
    "user_feature_flags"."enabled" AS "feature_enabled_for_user"
   FROM ("public"."user_feature_flags"
     JOIN "public"."feature_flags" ON (("user_feature_flags"."feature_flag_id" = "feature_flags"."id")));

ALTER TABLE "public"."user_feature_flags_view" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."user_products" WITH ("security_invoker"='on') AS
 SELECT "subscriptions"."id" AS "sub_id",
    "subscriptions"."user_id",
    "subscriptions"."status" AS "sub_status",
    "subscriptions"."metadata" AS "sub_meta",
    "subscriptions"."quantity" AS "sub_quantity",
    "subscriptions"."cancel_at_period_end" AS "sub_cancel_at_period_end",
    "subscriptions"."created" AS "sub_created",
    "subscriptions"."current_period_start" AS "sub_current_period_start",
    "subscriptions"."current_period_end" AS "sub_current_period_end",
    "subscriptions"."ended_at" AS "sub_ended_at",
    "subscriptions"."cancel_at" AS "sub_cancel_at",
    "subscriptions"."canceled_at" AS "sub_canceled_at",
    "subscriptions"."trial_start" AS "sub_trial_start",
    "subscriptions"."trial_end" AS "sub_trial_end",
    "products"."id" AS "product_id",
    "products"."name" AS "product_name",
    "products"."description" AS "product_description",
    "products"."image" AS "product_image",
    "products"."metadata" AS "product_metadata"
   FROM (("public"."products"
     JOIN "public"."prices" ON (("products"."id" = "prices"."product_id")))
     JOIN "public"."subscriptions" ON (("prices"."id" = "subscriptions"."price_id")));

ALTER TABLE "public"."user_products" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "granted_role" "text"
);

ALTER TABLE "public"."user_roles" OWNER TO "postgres";

ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");

ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_feature_key" UNIQUE ("feature");

ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."file_metadata"
    ADD CONSTRAINT "file_metadata_pkey" PRIMARY KEY ("s3_key");

ALTER TABLE ONLY "public"."kits"
    ADD CONSTRAINT "kits_pkey" PRIMARY KEY ("name");

ALTER TABLE ONLY "public"."oauth_creds"
    ADD CONSTRAINT "oauth_creds_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."oauth_creds"
    ADD CONSTRAINT "oauth_creds_service_account_id_key" UNIQUE ("service_account_id");

ALTER TABLE ONLY "public"."oauth_creds"
    ADD CONSTRAINT "oauth_creds_token_key" UNIQUE ("token");

ALTER TABLE ONLY "public"."operation_logs"
    ADD CONSTRAINT "operation_logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."operations"
    ADD CONSTRAINT "operations_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."operations"
    ADD CONSTRAINT "operations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_for_plan_key" UNIQUE ("for_plan");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."transaction_refunds"
    ADD CONSTRAINT "transaction_refunds_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."transaction_refunds"
    ADD CONSTRAINT "transaction_refunds_refund_for_key" UNIQUE ("refund_for");

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."upload_video_operations"
    ADD CONSTRAINT "upload_video_operations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_data_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_feature_flags"
    ADD CONSTRAINT "user_feature_flags_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."file_metadata"
    ADD CONSTRAINT "file_metadata_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id");

ALTER TABLE ONLY "public"."oauth_creds"
    ADD CONSTRAINT "oauth_creds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."operation_logs"
    ADD CONSTRAINT "operation_logs_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id");

ALTER TABLE ONLY "public"."operations"
    ADD CONSTRAINT "operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_for_plan_fkey" FOREIGN KEY ("for_plan") REFERENCES "public"."products"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id");

ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."transaction_refunds"
    ADD CONSTRAINT "transaction_refunds_refund_for_fkey" FOREIGN KEY ("refund_for") REFERENCES "public"."transactions"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."upload_video_operations"
    ADD CONSTRAINT "upload_video_operations_create_operation_id_fkey" FOREIGN KEY ("create_operation_id") REFERENCES "public"."operations"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."upload_video_operations"
    ADD CONSTRAINT "upload_video_operations_oauth_creds_id_fkey" FOREIGN KEY ("oauth_creds_id") REFERENCES "public"."oauth_creds"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_data_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_feature_flags"
    ADD CONSTRAINT "user_feature_flags_feature_flag_id_fkey" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flags"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_feature_flags"
    ADD CONSTRAINT "user_feature_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_granted_role_fkey" FOREIGN KEY ("granted_role") REFERENCES "public"."roles"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Allow public read-only access." ON "public"."prices" FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access." ON "public"."products" FOR SELECT USING (true);

CREATE POLICY "Allow users to view file metadata for operations they own" ON "public"."file_metadata" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "operations"."user_id"
   FROM "public"."operations"
  WHERE ("operations"."id" = "file_metadata"."operation_id"))));

CREATE POLICY "Allow users to view the transaction refunds associate with thei" ON "public"."transaction_refunds" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "transactions"."user_id"
   FROM "public"."transactions"
  WHERE ("transaction_refunds"."refund_for" = "transactions"."id"))));

CREATE POLICY "Allow users to view their own operations" ON "public"."operations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Allow users to view their own transactions" ON "public"."transactions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Allow users who own the operation to view its logs." ON "public"."operation_logs" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "operations"."user_id"
   FROM "public"."operations"
  WHERE ("operations"."id" = "operation_logs"."operation_id"))));

CREATE POLICY "Can only view own subs data." ON "public"."subscriptions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_feature_flags" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."kits" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."roles" FOR SELECT USING (true);

CREATE POLICY "Users can view own credits" ON "public"."user_data" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "id"));

CREATE POLICY "Users can view their own oauth creds" ON "public"."oauth_creds" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Users can view their own upload video operations related to cre" ON "public"."upload_video_operations" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = ( SELECT "operations"."user_id"
   FROM "public"."operations"
  WHERE ("operations"."id" = "upload_video_operations"."create_operation_id"))));

ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."file_metadata" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."kits" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."oauth_creds" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."operation_logs" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."operations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."prices" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."transaction_refunds" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."upload_video_operations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_data" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_feature_flags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."operation_logs";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."operations";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_data";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_operation_and_transaction"("user_id" "uuid", "video_title" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_operation_and_transaction"("user_id" "uuid", "video_title" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_operation_and_transaction"("user_id" "uuid", "video_title" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_upload_video_operation"("user_id" "uuid", "created_from_operation_id" "uuid", "using_oauth_creds_id" "uuid", "metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_upload_video_operation"("user_id" "uuid", "created_from_operation_id" "uuid", "using_oauth_creds_id" "uuid", "metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_upload_video_operation"("user_id" "uuid", "created_from_operation_id" "uuid", "using_oauth_creds_id" "uuid", "metadata" "jsonb") TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_all_operation_data"("operation_to_delete_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_all_operation_data"("operation_to_delete_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_all_operation_data"("operation_to_delete_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."gen_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."gen_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gen_id"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_quota_limits"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_quota_limits"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_quota_limits"("user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_create_video"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_create_video"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_create_video"("user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_upload_youtube_video"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_upload_youtube_video"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_quota_usage_daily_upload_youtube_video"("user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_failed_operation_refund"("operation_id" "uuid", "transaction_to_refund_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_failed_operation_refund"("operation_id" "uuid", "transaction_to_refund_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_failed_operation_refund"("operation_id" "uuid", "transaction_to_refund_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_failed_upload_video_operation_refund"("upload_video_operation_id" "uuid", "transaction_id_to_refund" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_failed_upload_video_operation_refund"("upload_video_operation_id" "uuid", "transaction_id_to_refund" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_failed_upload_video_operation_refund"("upload_video_operation_id" "uuid", "transaction_id_to_refund" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";

GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";

GRANT ALL ON SEQUENCE "public"."feature_flags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feature_flags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feature_flags_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."file_metadata" TO "anon";
GRANT ALL ON TABLE "public"."file_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."file_metadata" TO "service_role";

GRANT ALL ON TABLE "public"."kits" TO "anon";
GRANT ALL ON TABLE "public"."kits" TO "authenticated";
GRANT ALL ON TABLE "public"."kits" TO "service_role";

GRANT ALL ON TABLE "public"."oauth_creds" TO "anon";
GRANT ALL ON TABLE "public"."oauth_creds" TO "authenticated";
GRANT ALL ON TABLE "public"."oauth_creds" TO "service_role";

GRANT ALL ON TABLE "public"."operation_logs" TO "anon";
GRANT ALL ON TABLE "public"."operation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_logs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."operation_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."operation_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."operation_logs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."operations" TO "anon";
GRANT ALL ON TABLE "public"."operations" TO "authenticated";
GRANT ALL ON TABLE "public"."operations" TO "service_role";

GRANT ALL ON TABLE "public"."operations_filemetadata" TO "anon";
GRANT ALL ON TABLE "public"."operations_filemetadata" TO "authenticated";
GRANT ALL ON TABLE "public"."operations_filemetadata" TO "service_role";

GRANT ALL ON TABLE "public"."prices" TO "anon";
GRANT ALL ON TABLE "public"."prices" TO "authenticated";
GRANT ALL ON TABLE "public"."prices" TO "service_role";

GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON TABLE "public"."products_prices" TO "anon";
GRANT ALL ON TABLE "public"."products_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."products_prices" TO "service_role";

GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";

GRANT ALL ON TABLE "public"."transaction_refunds" TO "anon";
GRANT ALL ON TABLE "public"."transaction_refunds" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_refunds" TO "service_role";

GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";

GRANT ALL ON TABLE "public"."upload_video_operations" TO "anon";
GRANT ALL ON TABLE "public"."upload_video_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."upload_video_operations" TO "service_role";

GRANT ALL ON TABLE "public"."user_data" TO "anon";
GRANT ALL ON TABLE "public"."user_data" TO "authenticated";
GRANT ALL ON TABLE "public"."user_data" TO "service_role";

GRANT ALL ON TABLE "public"."user_feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."user_feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feature_flags" TO "service_role";

GRANT ALL ON TABLE "public"."user_feature_flags_view" TO "anon";
GRANT ALL ON TABLE "public"."user_feature_flags_view" TO "authenticated";
GRANT ALL ON TABLE "public"."user_feature_flags_view" TO "service_role";

GRANT ALL ON TABLE "public"."user_products" TO "anon";
GRANT ALL ON TABLE "public"."user_products" TO "authenticated";
GRANT ALL ON TABLE "public"."user_products" TO "service_role";

GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
