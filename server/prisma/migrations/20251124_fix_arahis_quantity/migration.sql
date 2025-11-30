-- Fix Арахіс products to use 100g portions (0.1) instead of 50g (0.05)
-- This ensures the feed shows correct prices: 250 UAH/kg * 0.1 = 25 UAH for 100g

UPDATE products 
SET custom_quantity = 0.1
WHERE display_name IN ('Арахіс сир', 'Арахіс солоний')
  AND custom_quantity = 0.05
  AND custom_unit = 'г';

