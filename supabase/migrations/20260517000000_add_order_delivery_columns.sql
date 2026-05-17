-- Add columns used by checkout (subtotal, delivery fee, landmark)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS landmark text;
