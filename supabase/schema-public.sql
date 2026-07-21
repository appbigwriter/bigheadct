-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  blog_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id),
  CONSTRAINT audit_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.blog_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'author'::text, 'viewer'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_members_pkey PRIMARY KEY (id),
  CONSTRAINT blog_members_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id)
);
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  schema_name text NOT NULL UNIQUE,
  domain text,
  template_type text NOT NULL DEFAULT 'blog'::text CHECK (template_type = ANY (ARRAY['blog'::text, 'store'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'archived'::text, 'pending'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'archived'::text, 'pending'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  business_type text NOT NULL CHECK (business_type = ANY (ARRAY['blog'::text, 'store'::text, 'saas'::text, 'custom'::text])),
  template_key text NOT NULL CHECK (template_key = ANY (ARRAY['blog_standard'::text, 'store_standard'::text, 'saas_standard'::text, 'custom_base'::text])),
  schema_name text NOT NULL UNIQUE,
  domain text,
  language text NOT NULL DEFAULT 'pt'::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'archived'::text, 'error'::text])),
  template_version text NOT NULL DEFAULT '1.0.0'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.provisioning_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blog_id uuid,
  job_type text NOT NULL CHECK (job_type = ANY (ARRAY['create_project'::text, 'upgrade_template'::text, 'rebuild_schema'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'success'::text, 'error'::text])),
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  project_id uuid,
  CONSTRAINT provisioning_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT provisioning_jobs_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id),
  CONSTRAINT provisioning_jobs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_type text NOT NULL DEFAULT 'blog'::text CHECK (template_type = ANY (ARRAY['blog'::text, 'store'::text, 'saas'::text, 'custom'::text])),
  version text NOT NULL DEFAULT '1.0.0'::text,
  source_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  template_key text UNIQUE,
  business_type text DEFAULT 'blog'::text CHECK (business_type = ANY (ARRAY['blog'::text, 'store'::text, 'saas'::text, 'custom'::text])),
  CONSTRAINT templates_pkey PRIMARY KEY (id)
);