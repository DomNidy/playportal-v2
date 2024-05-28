SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.6 (Ubuntu 15.6-1.pgdg20.04+1)

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


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6ec60583-2f14-4e86-b4be-925c744ae984', 'authenticated', 'authenticated', 'joe@mail.com', '$2a$10$LuYoyjaJIZ0MJlRSbRq3Ver7prT8GJJyajgFU.HfXd1789605Zp4e', '2024-05-27 23:27:50.243418+00', NULL, '', '2024-05-27 23:27:26.568568+00', '', NULL, '', '', NULL, '2024-05-27 23:27:52.806088+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6ec60583-2f14-4e86-b4be-925c744ae984", "email": "joe@mail.com", "email_verified": false, "phone_verified": false}', NULL, '2024-05-27 23:27:26.55886+00', '2024-05-27 23:27:52.809067+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6ec60583-2f14-4e86-b4be-925c744ae984', '6ec60583-2f14-4e86-b4be-925c744ae984', '{"sub": "6ec60583-2f14-4e86-b4be-925c744ae984", "email": "joe@mail.com", "email_verified": false, "phone_verified": false}', 'email', '2024-05-27 23:27:26.562676+00', '2024-05-27 23:27:26.56274+00', '2024-05-27 23:27:26.56274+00', '9e2a21c3-c83e-4a7b-ac05-0ec9523356cd');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('82141807-ecb8-495e-a8a6-5caee0b6fcfa', '6ec60583-2f14-4e86-b4be-925c744ae984', '2024-05-27 23:27:52.806181+00', '2024-05-27 23:27:52.806181+00', NULL, 'aal1', NULL, NULL, 'node', '172.28.0.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('82141807-ecb8-495e-a8a6-5caee0b6fcfa', '2024-05-27 23:27:52.809751+00', '2024-05-27 23:27:52.809751+00', 'email/signup', 'd48853cf-4d4b-4910-b07d-c668eff3520f');


-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."customers" ("id", "stripe_customer_id") VALUES
	('6ec60583-2f14-4e86-b4be-925c744ae984', 'cus_QBa7nCvIPoPr9b');


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."feature_flags" ("id", "feature", "enabled", "description") OVERRIDING SYSTEM VALUE VALUES
	(2, 'link_youtube_accounts', true, 'Displays functionality related to linking youtube accounts.'),
	(1, 'upload_videos', true, 'Displays functionality related to uploading videos.');


--
-- Data for Name: kits; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."kits" ("name", "created_at", "type", "image_url", "description", "download_url") VALUES
	('Aurora', '2024-05-17 00:59:18+00', 'midi-kit', 'aurora-kit.jpg', '20 Unique melodic midis.', 'https://drive.google.com/file/d/149yYIbLNikkCUUo2azdQ2aUAqCd7czuO/view?usp=sharing');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."products" ("id", "active", "name", "description", "image", "metadata") VALUES
	('prod_Q3XzdUf5tG1Mga', true, 'Playportal Basic Tier', 'The Basic tier subscription.', 'https://files.stripe.com/links/MDB8YWNjdF8xUDdrZklLbUhNT0ZlRzNNfGZsX3Rlc3RfdzQ1NGRQaFJOaHJaNmZsNmRqQVdlVFha00AgAGm8fq', '{}'),
	('prod_Q4figVjfXA0KD8', true, 'Playportal Pro Tier', 'The Pro tier subscription.', 'https://files.stripe.com/links/MDB8YWNjdF8xUDdrZklLbUhNT0ZlRzNNfGZsX3Rlc3RfdGVRcmVicldsZ0ptVzJsbjM4RkxBVVJ100NnN0ZTGY', '{}'),
	('prod_Q4faxEHXlIwvFP', true, 'Playportal Standard Tier', 'The Standard tier subscription.', 'https://files.stripe.com/links/MDB8YWNjdF8xUDdrZklLbUhNT0ZlRzNNfGZsX3Rlc3RfVExKTWJhY1B3TXlaZnR6WlJpc3VIdnJT00Pm1hYxkd', '{}');


--
-- Data for Name: prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."prices" ("id", "product_id", "active", "description", "unit_amount", "currency", "type", "interval", "interval_count", "trial_period_days", "metadata") VALUES
	('price_1PEWNGKmHMOFeG3MMI81IqfG', 'prod_Q4figVjfXA0KD8', true, NULL, 1999, 'usd', 'recurring', 'month', 1, 0, NULL),
	('price_1PEWFiKmHMOFeG3MMzeb38H0', 'prod_Q4faxEHXlIwvFP', true, NULL, 999, 'usd', 'recurring', 'month', 1, 0, NULL),
	('price_1PEX9uKmHMOFeG3MoNagLDYM', 'prod_Q3XzdUf5tG1Mga', true, NULL, 499, 'usd', 'recurring', 'month', 1, 0, NULL);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "create_video_daily_quota", "file_size_limit_mb", "for_plan", "upload_youtube_daily_quota") VALUES
	('basic_plan', 5, 100, 'prod_Q3XzdUf5tG1Mga', 5),
	('standard_plan', 10, 150, 'prod_Q4faxEHXlIwvFP', 10),
	('pro_plan', 30, 200, 'prod_Q4figVjfXA0KD8', 30);


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."subscriptions" ("id", "user_id", "status", "metadata", "price_id", "quantity", "cancel_at_period_end", "created", "current_period_start", "current_period_end", "ended_at", "cancel_at", "canceled_at", "trial_start", "trial_end") VALUES
	('sub_1PLCyCKmHMOFeG3MEnjqZ3Or', '6ec60583-2f14-4e86-b4be-925c744ae984', 'active', '{}', 'price_1PEWFiKmHMOFeG3MMzeb38H0', 1, false, '2024-05-27 22:28:48+00', '2024-05-27 22:28:48+00', '2024-06-27 22:28:48+00', NULL, NULL, NULL, NULL, NULL);



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_roles" ("user_id", "granted_role") VALUES
	('6ec60583-2f14-4e86-b4be-925c744ae984', 'standard_plan');


--
--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 3, true);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('"drizzle"."__drizzle_migrations_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: feature_flags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."feature_flags_id_seq"', 1, false);


--
-- Name: operation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."operation_logs_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
