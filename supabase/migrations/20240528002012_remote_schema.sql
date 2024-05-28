set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_operation_and_transaction(user_id uuid, video_title text)
 RETURNS operation_and_transaction_ids
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  op_id uuid;
  trans_id uuid;
begin
-- Create transaction record
  INSERT INTO public.transactions (user_id, type)
  VALUES (user_id, 'CreateVideo')
  RETURNING id INTO trans_id;

 
  -- Create operation document
  INSERT INTO public.operations (video_title, user_id)
  VALUES (video_title, user_id)
  RETURNING id INTO op_id;

  RETURN (op_id, trans_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.gen_id()
 RETURNS uuid
 LANGUAGE sql
AS $function$
  select extensions.uuid_generate_v4();
$function$
;

CREATE OR REPLACE FUNCTION public.handle_failed_operation_refund(operation_id uuid, transaction_to_refund_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
-- Set status to failed on operation
    UPDATE public.operations
    SET status = 'Failed'
    WHERE id = operation_id;

    -- Create transaction refund record
    INSERT INTO public.transaction_refunds (refund_for)
    VALUES (transaction_to_refund_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_failed_upload_video_operation_refund(upload_video_operation_id uuid, transaction_id_to_refund uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
-- Our refund logic is generic enough that this should work on any type of upload video operation, like we dont need to specify Youtube or soundcloud.
-- Set status to failed on operation
    UPDATE public.upload_video_operations
    SET status = 'Failed'
    WHERE id = upload_video_operation_id;

    -- Create transaction refund record
    INSERT INTO public.transaction_refunds (refund_for)
    VALUES (transaction_id_to_refund);
END;$function$
;


