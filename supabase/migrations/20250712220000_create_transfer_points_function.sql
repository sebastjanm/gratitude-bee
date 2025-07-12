-- Functions for handling favor points transfer
CREATE OR REPLACE FUNCTION transfer_points(sender_id_in uuid, receiver_id_in uuid, amount_in integer)
RETURNS void AS $$
BEGIN
  -- Decrement sender's score
  UPDATE public.users
  SET score = score - amount_in
  WHERE id = sender_id_in;

  -- Increment receiver's score
  UPDATE public.users
  SET score = score + amount_in
  WHERE id = receiver_id_in;
END;
$$ LANGUAGE plpgsql; 