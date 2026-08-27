// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Helpers ─────────────────────────────────────────────────
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// ─── Test Accounts ────────────────────────────────────────────
const testAccounts = [
  { email: 'customer@test.com', password: 'Test@1234', fullName: 'Test Customer', role: 'user' },
  { email: 'admin@test.com',    password: 'Test@1234', fullName: 'Test Admin',    role: 'admin' },
  { email: 'seller@test.com',   password: 'Test@1234', fullName: 'Test Seller',   role: 'seller' },
]

// ─── Seed Data ────────────────────────────────────────────────
// Every dataset now also carries the explore-page filter facets (modality,
// useCase, licenseType, qualityScore, annotationType, collectionMethod) and
// card-display fields (datasetCode, recordCount/recordUnit, languages,
// countries, compliance) added in the schema's filter-fields migration.
const datasets = [
  {
    title: 'Global E-Commerce Transactions 2024',
    description:
      'Over 2 million anonymised e-commerce transactions across 40 countries. Includes product category, purchase amount, device type, and return status. Ideal for churn prediction and customer segmentation models.',
    industry: 'E-Commerce',
    category: 'Transactional',
    language: 'English',
    modality: 'Tabular',
    useCase: 'Customer Segmentation',
    licenseType: 'Commercial',
    qualityScore: 8.7,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1001',
    recordCount: BigInt(2100000),
    recordUnit: 'transactions',
    languages: ['English', 'Spanish', 'French'],
    countries: ['US', 'GB', 'DE', 'FR', 'BR'],
    compliance: ['GDPR-compliant'],
    tags: ['transactions', 'ecommerce', 'customer-behavior', 'churn'],
    price: 149.99,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    fileFormat: '.csv',
    fileSizeBytes: BigInt(524288000), // 500 MB
    rowCount: 2100000,
    // Only this dataset is wired to a real Dodo Product for now — set
    // DODO_TEST_PRODUCT_ID in .env to the pdt_... id once it's created in the
    // Dodo dashboard, then re-run `npm run db:seed`.
    dodoProductId: process.env.DODO_TEST_PRODUCT_ID ?? null,
  },
  {
    title: 'Clinical Trial Records — Oncology Phase II',
    description:
      'De-identified clinical records from 14 Phase II oncology trials across three continents. Includes patient demographics, treatment arms, dosage logs, adverse events, and survival outcomes. HIPAA-compliant export.',
    industry: 'Healthcare',
    category: 'Clinical',
    language: 'English',
    modality: 'Tabular',
    useCase: 'Clinical Research',
    licenseType: 'Research-only',
    qualityScore: 9.4,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1002',
    recordCount: BigInt(85000),
    recordUnit: 'records',
    languages: ['English'],
    countries: ['US', 'GB', 'DE'],
    compliance: ['HIPAA-compliant', 'IRB-compliant'],
    tags: ['clinical-trials', 'oncology', 'healthcare', 'survival-analysis'],
    price: 499.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    fileFormat: '.parquet',
    fileSizeBytes: BigInt(209715200), // 200 MB
    rowCount: 85000,
  },
  {
    title: 'Indian Stock Market — 10-Year OHLCV Dataset',
    description:
      'Daily OHLCV (Open, High, Low, Close, Volume) data for 500+ NSE-listed equities from 2014 to 2024. Includes adjusted prices, corporate actions, and sector classifications. Perfect for backtesting trading strategies.',
    industry: 'BFSI',
    category: 'Time-Series',
    language: 'English',
    modality: 'Time-Series',
    useCase: 'Algorithmic Trading',
    licenseType: 'Commercial',
    qualityScore: 9.0,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1003',
    recordCount: BigInt(1250000),
    recordUnit: 'rows',
    languages: ['English'],
    countries: ['IN'],
    compliance: [],
    tags: ['stocks', 'finance', 'time-series', 'NSE', 'backtesting'],
    price: 299.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    fileFormat: '.csv',
    fileSizeBytes: BigInt(314572800), // 300 MB
    rowCount: 1250000,
  },
  {
    title: 'Twitter Sentiment Corpus — Tech Industry 2023',
    description:
      '4.8 million tweets from verified and unverified accounts discussing 150 major tech companies. Pre-labelled with sentiment (positive / neutral / negative) and emotion scores. Includes retweet counts and engagement metrics.',
    industry: 'Conversational AI',
    category: 'Social Media',
    language: 'English',
    modality: 'Text',
    useCase: 'Sentiment Analysis',
    licenseType: 'Commercial',
    qualityScore: 8.2,
    annotationType: 'Classification Label',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1004',
    recordCount: BigInt(4800000),
    recordUnit: 'tweets',
    languages: ['English'],
    countries: ['US', 'GB'],
    compliance: [],
    tags: ['nlp', 'sentiment', 'twitter', 'social-media', 'text-classification'],
    price: 89.99,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80',
    fileFormat: '.json',
    fileSizeBytes: BigInt(1073741824), // 1 GB
    rowCount: 4800000,
  },
  {
    title: 'Urban Traffic Camera — Annotated Object Detection',
    description:
      '120,000 frames extracted from traffic cameras across 8 cities, annotated with YOLO-format bounding boxes for pedestrians, cars, motorcycles, buses, and traffic signs. Day and night splits included.',
    industry: 'Robotics',
    category: 'Image Annotation',
    language: 'English',
    modality: 'Image',
    useCase: 'Object Detection',
    licenseType: 'Commercial',
    qualityScore: 8.9,
    annotationType: 'Bounding Box',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1005',
    recordCount: BigInt(120000),
    recordUnit: 'frames',
    languages: ['English'],
    countries: ['US', 'DE', 'JP'],
    compliance: [],
    tags: ['cv', 'object-detection', 'yolo', 'traffic', 'annotation'],
    price: 349.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    fileFormat: '.zip',
    fileSizeBytes: BigInt(5368709120), // 5 GB
    rowCount: 120000,
  },
  {
    title: 'Global Weather Stations — 30-Year Climate Records',
    description:
      'Daily observations from 6,200 weather stations worldwide covering 1994–2024. Includes temperature, humidity, precipitation, wind speed, UV index, and air quality index (AQI). Data sourced from NOAA and local meteorological agencies.',
    industry: 'Climate',
    category: 'Environmental',
    language: 'English',
    modality: 'Time-Series',
    useCase: 'Forecasting',
    licenseType: 'Commercial',
    qualityScore: 8.4,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1006',
    recordCount: BigInt(67000000),
    recordUnit: 'readings',
    languages: ['English'],
    countries: ['US', 'GB', 'AU', 'IN', 'BR'],
    compliance: [],
    tags: ['climate', 'weather', 'geospatial', 'environment', 'time-series'],
    price: 199.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&q=80',
    fileFormat: '.parquet',
    fileSizeBytes: BigInt(2147483648), // 2 GB
    rowCount: 67000000,
  },
  {
    title: 'Multi-Language News Articles — 12 Languages',
    description:
      'Curated corpus of 900,000 news articles published between 2020–2024 across 12 languages including Hindi, Arabic, French, Mandarin, and Spanish. Categorised by topic (Politics, Business, Sports, Tech, Health). Ideal for multilingual NLP tasks.',
    industry: 'Conversational AI',
    category: 'Text Corpus',
    language: 'Multilingual',
    modality: 'Text',
    useCase: 'Text Classification',
    licenseType: 'Commercial',
    qualityScore: 8.0,
    annotationType: 'Classification Label',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1007',
    recordCount: BigInt(900000),
    recordUnit: 'articles',
    languages: ['Hindi', 'Arabic', 'French', 'Mandarin', 'Spanish', 'English'],
    countries: ['IN', 'FR', 'CN', 'ES', 'US'],
    compliance: [],
    tags: ['nlp', 'multilingual', 'news', 'text-corpus', 'classification'],
    price: 129.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    fileFormat: '.json',
    fileSizeBytes: BigInt(786432000), // 750 MB
    rowCount: 900000,
  },
  {
    title: 'Retail Store Footfall & Heatmap Data',
    description:
      'Anonymised in-store footfall logs from 80 retail outlets across India. Includes zone-level heatmaps, dwell time, peak-hour patterns, and conversion funnel data. 18-month coverage with pre and post festive season splits.',
    industry: 'E-Commerce',
    category: 'Retail Analytics',
    language: 'English',
    modality: 'Tabular',
    useCase: 'Retail Analytics',
    licenseType: 'Commercial',
    qualityScore: 7.8,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1008',
    recordCount: BigInt(430000),
    recordUnit: 'visits',
    languages: ['English'],
    countries: ['IN'],
    compliance: [],
    tags: ['retail', 'footfall', 'heatmap', 'in-store', 'analytics'],
    price: 219.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    fileFormat: '.csv',
    fileSizeBytes: BigInt(157286400), // 150 MB
    rowCount: 430000,
  },
  {
    title: 'Satellite Land-Use Classification — South Asia',
    description:
      'High-resolution satellite imagery tiles (10m/px) covering South Asia, labelled for land-use classification: urban, agricultural, forest, water bodies, industrial. Sourced from Sentinel-2 with seasonal variation sets.',
    industry: 'Geospatial',
    category: 'Satellite Imagery',
    language: 'English',
    modality: 'Image',
    useCase: 'Segmentation',
    licenseType: 'Commercial',
    qualityScore: 9.1,
    annotationType: 'Segmentation',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1009',
    recordCount: BigInt(50000),
    recordUnit: 'tiles',
    languages: ['English'],
    countries: ['IN', 'PK', 'BD', 'LK'],
    compliance: [],
    tags: ['geospatial', 'satellite', 'land-use', 'remote-sensing', 'segmentation'],
    price: 599.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=800&q=80',
    fileFormat: '.tiff',
    fileSizeBytes: BigInt(10737418240), // 10 GB
    rowCount: 50000,
  },
  {
    title: 'Customer Support Chat Logs — SaaS Industry',
    description:
      'Anonymised chat logs from customer support interactions at 12 SaaS companies. 320,000 conversations labelled with resolution status, customer satisfaction score (CSAT), issue category, and agent response time. Great for training support bots.',
    industry: 'Conversational AI',
    category: 'Conversational AI',
    language: 'English',
    modality: 'Text',
    useCase: 'Intent Classification',
    licenseType: 'Commercial',
    qualityScore: 8.5,
    annotationType: 'Classification Label',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1010',
    recordCount: BigInt(320000),
    recordUnit: 'conversations',
    languages: ['English'],
    countries: ['US', 'GB', 'CA'],
    compliance: [],
    tags: ['chat', 'customer-support', 'nlp', 'csat', 'conversational-ai'],
    price: 179.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    fileFormat: '.json',
    fileSizeBytes: BigInt(419430400), // 400 MB
    rowCount: 320000,
  },
  {
    title: 'Medical Imaging Annotation — CT & MRI Scans',
    description:
      '1.8 million de-identified CT and MRI scans annotated for tumor segmentation and organ boundaries across 6 countries. Reviewed by board-certified radiologists. IRB-approved collection protocol.',
    industry: 'Healthcare',
    category: 'Medical Imaging',
    language: 'English',
    modality: 'Image',
    useCase: 'Diagnostic Annotation',
    licenseType: 'Research-only',
    qualityScore: 9.2,
    annotationType: 'Segmentation',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1032',
    recordCount: BigInt(1800000),
    recordUnit: 'scans',
    languages: ['English', 'French'],
    countries: ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
    compliance: ['IRB-compliant', 'HIPAA-compliant'],
    tags: ['medical-imaging', 'dicom', 'segmentation', 'healthcare', 'radiology'],
    price: 799.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
    fileFormat: 'DICOM',
    fileSizeBytes: BigInt(21474836480), // 20 GB
    rowCount: 1800000,
  },
  {
    title: 'Radiology Chest X-Ray Screening Dataset',
    description:
      '600,000 chest X-rays labelled for 14 common thoracic conditions (pneumonia, effusion, cardiomegaly, etc.). Multi-institution collection with radiologist consensus labels.',
    industry: 'Healthcare',
    category: 'Medical Imaging',
    language: 'English',
    modality: 'Image',
    useCase: 'Diagnostic Classification',
    licenseType: 'Research-only',
    qualityScore: 9.1,
    annotationType: 'Classification Label',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1011',
    recordCount: BigInt(600000),
    recordUnit: 'X-rays',
    languages: ['English'],
    countries: ['US', 'GB'],
    compliance: ['HIPAA-compliant', 'IRB-compliant'],
    tags: ['radiology', 'chest-xray', 'healthcare', 'classification'],
    price: 649.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=800&q=80',
    fileFormat: 'DICOM',
    fileSizeBytes: BigInt(9663676416), // 9 GB
    rowCount: 600000,
  },
  {
    title: 'Multilingual Chatbot Intent Corpus',
    description:
      '250,000 labelled user utterances across 9 languages for training intent-classification and slot-filling models in customer-facing chatbots.',
    industry: 'Conversational AI',
    category: 'Conversational AI',
    language: 'Multilingual',
    modality: 'Text',
    useCase: 'Intent Classification',
    licenseType: 'Commercial',
    qualityScore: 8.6,
    annotationType: 'Classification Label',
    collectionMethod: 'Crowdsourced',
    datasetCode: 'DS-1012',
    recordCount: BigInt(250000),
    recordUnit: 'utterances',
    languages: ['English', 'Spanish', 'French', 'German', 'Hindi'],
    countries: ['US', 'ES', 'FR', 'DE', 'IN'],
    compliance: [],
    tags: ['chatbot', 'intent-classification', 'nlp', 'multilingual'],
    price: 159.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80',
    fileFormat: '.json',
    fileSizeBytes: BigInt(367001600), // 350 MB
    rowCount: 250000,
  },
  {
    title: 'Warehouse Robot Navigation Logs',
    description:
      'LiDAR and odometry logs from autonomous warehouse robots navigating 40 fulfillment centers. Includes obstacle events, path corrections, and collision-avoidance labels for path-planning models.',
    industry: 'Robotics',
    category: 'Sensor Logs',
    language: 'English',
    modality: 'Sensor',
    useCase: 'Path Planning',
    licenseType: 'Commercial',
    qualityScore: 8.3,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1013',
    recordCount: BigInt(3200000),
    recordUnit: 'log entries',
    languages: ['English'],
    countries: ['US', 'DE'],
    compliance: [],
    tags: ['robotics', 'lidar', 'navigation', 'warehouse', 'path-planning'],
    price: 449.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    fileFormat: '.parquet',
    fileSizeBytes: BigInt(3221225472), // 3 GB
    rowCount: 3200000,
  },
  {
    title: 'Credit Card Fraud Transaction Dataset',
    description:
      '3.4 million anonymised card transactions labelled fraudulent / legitimate, with device fingerprint, merchant category, and velocity features. Balanced sampling available.',
    industry: 'BFSI',
    category: 'Fraud Detection',
    language: 'English',
    modality: 'Tabular',
    useCase: 'Fraud Detection',
    licenseType: 'Commercial',
    qualityScore: 8.9,
    annotationType: 'Classification Label',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1014',
    recordCount: BigInt(3400000),
    recordUnit: 'transactions',
    languages: ['English'],
    countries: ['US', 'GB', 'CA'],
    compliance: ['PCI-DSS-compliant'],
    tags: ['fraud-detection', 'bfsi', 'finance', 'classification'],
    price: 379.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    fileFormat: '.csv',
    fileSizeBytes: BigInt(692060160), // 660 MB
    rowCount: 3400000,
  },
  {
    title: 'Loan Default Risk Scoring Dataset',
    description:
      '1.1 million anonymised loan applications with repayment outcomes, credit bureau features, and income verification flags. Built for credit-risk scoring models.',
    industry: 'BFSI',
    category: 'Risk Scoring',
    language: 'English',
    modality: 'Tabular',
    useCase: 'Risk Scoring',
    licenseType: 'Commercial',
    qualityScore: 8.5,
    annotationType: 'None',
    collectionMethod: 'Real-world',
    datasetCode: 'DS-1015',
    recordCount: BigInt(1100000),
    recordUnit: 'applications',
    languages: ['English'],
    countries: ['US', 'IN'],
    compliance: [],
    tags: ['credit-risk', 'bfsi', 'finance', 'scoring'],
    price: 269.00,
    currency: 'USD',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    fileFormat: '.csv',
    fileSizeBytes: BigInt(262144000), // 250 MB
    rowCount: 1100000,
  },
]

// ─── Seeders ─────────────────────────────────────────────────
async function seedUsers() {
  console.log('🌱  Seeding test accounts...')

  for (const account of testAccounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    })

    let userId = data?.user?.id

    if (error) {
      if (error.message.includes('already been registered')) {
        console.warn(`  ⚠  ${account.email} already exists in auth — fetching existing id`)
        const { data: list } = await supabase.auth.admin.listUsers()
        userId = list.users.find(u => u.email === account.email)?.id
      } else {
        console.error(`  ✖  Auth error for ${account.email}: ${error.message}`)
        throw new Error(`Auth error for ${account.email}: ${error.message}`)
      }
    }

    if (!userId) {
      throw new Error(`Could not resolve userId for ${account.email}`)
    }

    // small delay for the DB trigger to fire and create the public.users row
    await new Promise(r => setTimeout(r, 500))

    await prisma.user.upsert({
      where: { id: userId },
      update: { fullName: account.fullName, role: account.role },
      create: { id: userId, email: account.email, fullName: account.fullName, role: account.role },
    })

    console.log(`  ✓  ${account.email} (${account.role})`)
  }

  console.log(`  ✓  ${testAccounts.length} test accounts seeded\n`)
}

async function seedDatasets() {
  console.log('🌱  Seeding datasets...')

  await prisma.dataset.deleteMany()
  console.log('  ✓  Cleared existing datasets')

  for (const data of datasets) {
    const dataset = await prisma.dataset.create({
      data: { ...data, slug: slugify(data.title) },
    })
    console.log(`  ✓  ${dataset.title} (${dataset.slug})`)
  }

  console.log(`  ✓  ${datasets.length} datasets seeded\n`)
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  Starting seed...\n')
  await seedUsers()
  await seedDatasets()
  console.log('✅  Seed complete.')
}

main()
  .catch(e => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })