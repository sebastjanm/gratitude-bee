-- This function correctly transfers points for completed favors
-- by updating the 'favor_points' column on the 'wallets' table.
CREATE OR REPLACE FUNCTION transfer_favor_points(sender_id_in uuid, receiver_id_in uuid, amount_in integer)
RETURNS void AS $$
BEGIN
  -- Decrement sender's favor_points in the wallets table
  UPDATE public.wallets
  SET favor_points = favor_points - amount_in
  WHERE user_id = sender_id_in;

  -- Increment receiver's favor_points in the wallets table
  UPDATE public.wallets
  SET favor_points = favor_points + amount_in
  WHERE user_id = receiver_id_in;
END;
$$ LANGUAGE plpgsql; 