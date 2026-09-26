-- Fill acceptance_rate (percent, same unit as MIT's existing 4.60) from the latest
-- official class profile or Common Data Set. UPDATE only. No schema change.
-- Apply manually. Do not run this from the app.
-- KAIST is omitted: it publishes a domestic early-admission competition ratio, not an overall admit rate.

-- Class of 2029 admit rate 4.2% (47,893 applicants, 2,003 admitted).
-- https://oira.harvard.edu/factbook/fact-book-admissions/
update public.universities set acceptance_rate = 4.2 where slug = 'harvard';

-- CDS 2025-2026, Class of 2029: 60,646 applicants, 2,302 admitted = 3.80%.
-- https://irds.stanford.edu/data-findings/cds
update public.universities set acceptance_rate = 3.8 where slug = 'stanford';

-- CDS 2025-26, Fall 2025: 42,303 applicants, 1,868 admitted = 4.42%.
-- https://ir.princeton.edu/sites/g/files/toruqf2041/files/documents/CDS_2526_Princeton_v2.pdf
update public.universities set acceptance_rate = 4.42 where slug = 'princeton';

-- Yale News, Class of 2029: 2,308 admitted of 50,228 applicants = 4.60%.
-- https://news.yale.edu/2025/03/27/yale-admits-2308-applicants-class-2029
update public.universities set acceptance_rate = 4.6 where slug = 'yale';

-- Class of 2029 profile: 59,616 applications, 2,946 admits = 4.94%.
-- https://undergrad.admissions.columbia.edu/sites/default/files/2025-08/Columbia%20Class%20of%202029%20Profile.pdf
update public.universities set acceptance_rate = 4.94 where slug = 'columbia';

-- Office of Admissions, Class of 2029: 1,702 of 28,230, published as 6%.
-- https://admissions.dartmouth.edu/news/2025/03/dartmouth-offers-admission-1702-undergrad-applicants
update public.universities set acceptance_rate = 6.0 where slug = 'dartmouth';

-- Class of 2029 profile labels the overall rate 5.2% (58,712 applications).
-- https://admissions.duke.edu/wp-content/uploads/2026/02/2029ClassProfile.pdf
update public.universities set acceptance_rate = 5.2 where slug = 'duke';

-- Class of 2029: 15,819 applicants, 1,222 admitted = 7.72%.
-- https://www.amherst.edu/news/news_releases/2025/september/welcome-new-mammoths
update public.universities set acceptance_rate = 7.72 where slug = 'amherst';

-- Class of 2029: 1,334 offers of 29,281 applications, published as 4.6%.
-- https://facts.mit.edu/undergraduate-admissions/
update public.universities set acceptance_rate = 4.6 where slug = 'mit';

-- Institutional Research, Class of 2029: 957 of 14,045, published as 6.8%.
-- https://www.bowdoin.edu/ir/data/index.html
update public.universities set acceptance_rate = 6.8 where slug = 'bowdoin';

-- IPEDS 2024: 330 admitted of 10,864 applicants = 3.04%.
-- https://nces.ed.gov/collegenavigator/?id=484844
update public.universities set acceptance_rate = 3.04 where slug = 'minerva';
