--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: billing_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.billing_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    subscription_id uuid,
    stripe_invoice_id text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    payment_method text,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp without time zone,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.billing_history OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    author text NOT NULL,
    publish_date timestamp without time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faqs OWNER TO postgres;

--
-- Name: feature_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feature_id uuid NOT NULL,
    user_id uuid,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.feature_votes OWNER TO postgres;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: outlets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outlets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    phone character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.outlets OWNER TO postgres;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: roadmap_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roadmap_features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    estimated_quarter text,
    completed_at timestamp without time zone,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roadmap_features OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency text DEFAULT 'IDR'::text NOT NULL,
    "interval" text DEFAULT 'monthly'::text NOT NULL,
    max_outlets integer DEFAULT 1 NOT NULL,
    max_users integer DEFAULT 5 NOT NULL,
    features text[] DEFAULT ARRAY[]::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    stripe_subscription_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    end_date timestamp without time zone NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tenant_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_modules (
    tenant_id uuid NOT NULL,
    module_id uuid NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    enabled_at timestamp without time zone DEFAULT now() NOT NULL,
    enabled_by uuid NOT NULL
);


ALTER TABLE public.tenant_modules OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name text NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    status text DEFAULT 'trial'::text NOT NULL,
    trial_ends_at timestamp without time zone,
    subscription_id uuid,
    stripe_customer_id text,
    max_outlets integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_name text NOT NULL,
    customer_title text NOT NULL,
    customer_company text NOT NULL,
    testimonial text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    avatar_url text,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'staff'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: billing_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.billing_history (id, tenant_id, subscription_id, stripe_invoice_id, amount, currency, payment_method, status, paid_at, description, created_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, excerpt, content, author, publish_date, status, views, category, tags, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faqs (id, question, answer, category, is_published, "order", views, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: feature_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_votes (id, feature_id, user_id, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, name, display_name, description, is_default, created_at) FROM stdin;
282f9b47-25e2-471a-8ca7-61ac1dbfa0cd	pos	Point of Sale	Core POS functionality for sales processing	t	2025-09-17 20:28:54.938288
11386ab7-4fbd-4ba9-9f7d-8edd7d731b0a	inventory	Inventory Management	Track and manage product inventory	t	2025-09-17 20:28:54.938288
e743987a-5d73-48b7-b5ba-971ca1b97638	reports	Reports & Analytics	Sales reports and business analytics	f	2025-09-17 20:28:54.938288
c77361a7-ac87-4c48-9420-513c645a0d8b	loyalty	Loyalty Program	Customer loyalty and rewards program	f	2025-09-17 20:28:54.938288
\.


--
-- Data for Name: outlets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outlets (id, tenant_id, name, address, phone, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
8d5e31ca-2302-4ce8-acf5-ec793f4748df	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzeXN0ZW0uY29tIiwiaWF0IjoxNzU4MTQxMDg0LCJleHAiOjE3NTg3NDU4ODR9.XROB7TwQr9fcwbAG-5g8jLV1FLa9sSAOHAle6aKZloc	2025-09-24 20:31:24.829	2025-09-17 20:31:24.830414
39215528-dd04-47ea-a4a0-1d699932ac0a	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN5c3RlbS5jb20iLCJpYXQiOjE3NTgxNDExNjQsImV4cCI6MTc1ODc0NTk2NH0._pBu1s8JDomzZIbx8EXBp-F62MtXcNB5kfbkwg6OEzc	2025-09-24 20:32:44.987	2025-09-17 20:32:44.987997
04d7ae26-d3b8-4a1f-bab0-0a79cedede23	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBzeXN0ZW0uY29tIiwiaWF0IjoxNzU4MTQxNjAxLCJleHAiOjE3NTg3NDY0MDF9.q9aSOK5guxTd7fxMYks0Zj1HQANsLpLxx9B8M7aUH-Q	2025-09-24 20:40:01.687	2025-09-17 20:40:01.688204
72be43c5-a7bb-4c31-8eed-2773720f2ec7	236b15ae-5c76-403d-bd13-c3fccac7580c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMzZiMTVhZS01Yzc2LTQwM2QtYmQxMy1jM2ZjY2FjNzU4MGMiLCJ0ZW5hbnRJZCI6IjZiNmNhYWFmLWEzNGUtNDg1OS05NWMzLWM3YjMwZWQxOGRlMSIsInJvbGUiOiJ0ZW5hbnRfb3duZXIiLCJlbWFpbCI6ImFkbWluQG93bmVyLmNvbSIsImlhdCI6MTc1ODE0MjA0NSwiZXhwIjoxNzU4NzQ2ODQ1fQ.VzLBTTUdrfN_p0oixcKA4rREhvZG-19eNYs_XGEV6yw	2025-09-24 20:47:25.894	2025-09-17 20:47:25.895239
d6fef239-a742-4f31-b7ad-509386a1b459	38477644-22ba-4bfe-aa31-82068307b9ed	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODQ3NzY0NC0yMmJhLTRiZmUtYWEzMS04MjA2ODMwN2I5ZWQiLCJ0ZW5hbnRJZCI6IjZiNmNhYWFmLWEzNGUtNDg1OS05NWMzLWM3YjMwZWQxOGRlMSIsInJvbGUiOiJzdGFmZiIsImVtYWlsIjoiYWRtaW5Ac3RhZmYuY29tIiwiaWF0IjoxNzU4MTQyMDQ3LCJleHAiOjE3NTg3NDY4NDd9.yRWWXB8l3VVUPinpEnZj_ThH0yYtFbnftwdr7M-lBwU	2025-09-24 20:47:27.009	2025-09-17 20:47:27.009958
b3039b79-0fd6-4f77-92de-e15ef9c9724a	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN5c3RlbS5jb20iLCJpYXQiOjE3NTgxNDIxNjAsImV4cCI6MTc1ODc0Njk2MH0.z_2ncdQPOsRJn7SKVmUNYGoKexZ2ZRWJKEei-Y4FpsQ	2025-09-24 20:49:20.053	2025-09-17 20:49:20.053874
78d7a19d-cf37-4a75-9d62-684d21f4def4	9519bbe5-f835-4e5e-9848-fde5dbbdae71	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NTE5YmJlNS1mODM1LTRlNWUtOTg0OC1mZGU1ZGJiZGFlNzEiLCJ0ZW5hbnRJZCI6bnVsbCwicm9sZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN5c3RlbS5jb20iLCJpYXQiOjE3NTgxNDIyMDksImV4cCI6MTc1ODc0NzAwOX0.D0EWgjF3Dyzottoj3zAWrnbQDGfPdQMe_7FMq--km7w	2025-09-24 20:50:09.629	2025-09-17 20:50:09.629943
\.


--
-- Data for Name: roadmap_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roadmap_features (id, title, description, category, status, priority, estimated_quarter, completed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, description, price, currency, "interval", max_outlets, max_users, features, is_active, created_at) FROM stdin;
4c287323-23eb-42fa-9491-7571064abdea	Basic	Perfect for small businesses	250000.00	IDR	monthly	1	3	{"Basic POS","Inventory Management","Sales Reports","Email Support"}	t	2025-09-17 20:28:54.931469
63bd4aec-422d-4954-9038-395d83ba81d9	Pro	Great for growing businesses	500000.00	IDR	monthly	5	10	{"Advanced POS","Multi-outlet Management","Advanced Reports","Loyalty Program","Priority Support"}	t	2025-09-17 20:28:54.931469
d7efc3fc-26e9-47e5-a3e7-5235a8256c6f	Enterprise	For large businesses	1000000.00	IDR	monthly	999	999	{"Enterprise POS","Unlimited Outlets","Custom Reports","API Access","Dedicated Support"}	t	2025-09-17 20:28:54.931469
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, tenant_id, plan_id, stripe_subscription_id, status, start_date, end_date, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenant_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenant_modules (tenant_id, module_id, is_enabled, enabled_at, enabled_by) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, business_name, email, phone, address, status, trial_ends_at, subscription_id, stripe_customer_id, max_outlets, created_at, updated_at) FROM stdin;
6b6caaaf-a34e-4859-95c3-c7b30ed18de1	Test Business	test@business.com	+62812345678	Test Address	trial	2025-10-17 20:46:20.327	\N	\N	1	2025-09-17 20:46:20.361557	2025-09-17 20:46:20.361557
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, customer_name, customer_title, customer_company, testimonial, rating, is_published, is_featured, avatar_url, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, username, email, password_hash, role, is_active, last_login_at, stripe_customer_id, stripe_subscription_id, created_at, updated_at) FROM stdin;
9519bbe5-f835-4e5e-9848-fde5dbbdae71	\N	superadmin	admin@system.com	$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K	superadmin	t	\N	\N	\N	2025-09-17 05:02:43.769	2025-09-17 05:02:43.769
236b15ae-5c76-403d-bd13-c3fccac7580c	6b6caaaf-a34e-4859-95c3-c7b30ed18de1	owner	admin@owner.com	$2a$10$pmtIkAY5RmiCLUXVetHS3eOxvpgTnTeWmjLtt7zlJk3wQXeKPejXS	tenant_owner	t	\N	\N	\N	2025-09-17 20:47:11.845804	2025-09-17 20:47:11.845804
38477644-22ba-4bfe-aa31-82068307b9ed	6b6caaaf-a34e-4859-95c3-c7b30ed18de1	staff	admin@staff.com	$2a$10$pmtIkAY5RmiCLUXVetHS3eOxvpgTnTeWmjLtt7zlJk3wQXeKPejXS	staff	t	\N	\N	\N	2025-09-17 20:47:11.845804	2025-09-17 20:47:11.845804
\.


--
-- Name: billing_history billing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_pkey PRIMARY KEY (id);


--
-- Name: billing_history billing_history_stripe_invoice_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_stripe_invoice_id_unique UNIQUE (stripe_invoice_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: feature_votes feature_votes_feature_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_feature_id_user_id_unique UNIQUE (feature_id, user_id);


--
-- Name: feature_votes feature_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: outlets outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: roadmap_features roadmap_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roadmap_features
    ADD CONSTRAINT roadmap_features_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: tenant_modules tenant_modules_tenant_id_module_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_tenant_id_module_id_pk PRIMARY KEY (tenant_id, module_id);


--
-- Name: tenants tenants_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_email_unique UNIQUE (email);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: billing_history billing_history_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: billing_history billing_history_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.billing_history
    ADD CONSTRAINT billing_history_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: blog_posts blog_posts_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: faqs faqs_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: feature_votes feature_votes_feature_id_roadmap_features_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_feature_id_roadmap_features_id_fk FOREIGN KEY (feature_id) REFERENCES public.roadmap_features(id);


--
-- Name: feature_votes feature_votes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_votes
    ADD CONSTRAINT feature_votes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: outlets outlets_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: outlets outlets_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: roadmap_features roadmap_features_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roadmap_features
    ADD CONSTRAINT roadmap_features_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: subscriptions subscriptions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_modules tenant_modules_enabled_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_enabled_by_users_id_fk FOREIGN KEY (enabled_by) REFERENCES public.users(id);


--
-- Name: tenant_modules tenant_modules_module_id_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_module_id_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: tenant_modules tenant_modules_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_modules
    ADD CONSTRAINT tenant_modules_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: testimonials testimonials_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- PostgreSQL database dump complete
--

