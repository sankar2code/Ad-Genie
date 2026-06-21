-- Expands the retailer roster from 3 (target, walmart, cvs) to 7, adding
-- Macy's, Best Buy, Whole Foods, and JCPenney.

alter table offers drop constraint if exists offers_store_check;
alter table offers add constraint offers_store_check
  check (store in ('target', 'walmart', 'cvs', 'macys', 'bestbuy', 'wholefoods', 'jcpenney'));
