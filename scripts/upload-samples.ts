/**
 * scripts/upload-samples.ts
 *
 * Generates a small, realistic PREVIEW sample for each seeded dataset, uploads it
 * to the public `dataset-samples` bucket at `samples/<slug>.<ext>`, and writes the
 * resulting public CDN URL back to `dataset.sampleUrl`.
 *
 * Samples are free previews of dataset STRUCTURE (a handful of rows/records) — for
 * binary formats (.parquet / .tiff / .zip / DICOM) the preview is a CSV/JSON that
 * shows the schema, since a real binary chunk isn't a useful preview anyway.
 *
 * Idempotent: upsert overwrites, and only the datasets listed below are touched.
 * The "Multi-Language News Articles" dataset is intentionally SKIPPED — it already
 * has a sampleUrl uploaded manually.
 *
 * Run: npx tsx scripts/upload-samples.ts
 *      npx tsx scripts/upload-samples.ts --dry-run
 */
import './load-env'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/prisma'

const BUCKET = 'dataset-samples'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Slugs whose sampleUrl is already set manually — never overwrite.
const SKIP_SLUGS = new Set(['multi-language-news-articles-12-languages'])

interface Sample {
  slug: string
  ext: 'csv' | 'json'
  contentType: string
  content: string
}

const csv = (header: string, rows: string[]): string => [header, ...rows].join('\n') + '\n'
const json = (rows: unknown[]): string => JSON.stringify(rows, null, 2)

const samples: Sample[] = [
  {
    slug: 'global-e-commerce-transactions-2024',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'transaction_id,timestamp,country,product_category,purchase_amount,currency,device_type,payment_method,is_returned,customer_id',
      [
        'TXN-100001,2024-01-04T09:12:33Z,US,Electronics,249.99,USD,mobile,card,false,CUST-88213',
        'TXN-100002,2024-01-04T09:15:02Z,GB,Apparel,54.00,GBP,desktop,paypal,true,CUST-11902',
        'TXN-100003,2024-01-04T10:02:47Z,DE,Home & Kitchen,88.50,EUR,mobile,card,false,CUST-40031',
        'TXN-100004,2024-01-04T11:31:19Z,FR,Beauty,32.20,EUR,tablet,card,false,CUST-77410',
        'TXN-100005,2024-01-04T12:44:05Z,BR,Electronics,410.75,BRL,mobile,pix,false,CUST-20915',
        'TXN-100006,2024-01-05T08:07:56Z,US,Grocery,17.40,USD,mobile,card,false,CUST-88213',
        'TXN-100007,2024-01-05T13:22:41Z,GB,Toys,29.99,GBP,desktop,card,true,CUST-63088',
        'TXN-100008,2024-01-05T15:59:10Z,DE,Sports,145.00,EUR,desktop,paypal,false,CUST-40031',
        'TXN-100009,2024-01-06T07:48:33Z,FR,Apparel,72.10,EUR,mobile,card,false,CUST-51277',
        'TXN-100010,2024-01-06T18:03:27Z,BR,Home & Kitchen,63.30,BRL,tablet,pix,false,CUST-20915',
      ]
    ),
  },
  {
    slug: 'clinical-trial-records-oncology-phase-ii',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'patient_id,trial_id,age,sex,cancer_type,treatment_arm,dosage_mg,adverse_event,ecog_status,survival_days,outcome',
      [
        'PT-0001,TRIAL-ONC-02A,61,F,Breast,Arm-A,120,none,1,412,alive',
        'PT-0002,TRIAL-ONC-02A,54,M,Colorectal,Arm-B,80,nausea,0,388,alive',
        'PT-0003,TRIAL-ONC-02B,67,F,Lung,Arm-A,120,fatigue,2,201,deceased',
        'PT-0004,TRIAL-ONC-02B,49,M,Lung,Placebo,0,none,1,340,alive',
        'PT-0005,TRIAL-ONC-02C,72,F,Ovarian,Arm-B,80,neutropenia,2,156,deceased',
        'PT-0006,TRIAL-ONC-02C,58,M,Prostate,Arm-A,120,none,0,455,alive',
        'PT-0007,TRIAL-ONC-02A,63,F,Breast,Placebo,0,none,1,470,alive',
        'PT-0008,TRIAL-ONC-02B,45,M,Colorectal,Arm-B,80,vomiting,1,299,alive',
      ]
    ),
  },
  {
    slug: 'indian-stock-market-10-year-ohlcv-dataset',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'date,symbol,open,high,low,close,volume,adj_close,sector',
      [
        '2024-03-01,RELIANCE,2945.00,2988.40,2931.10,2976.55,7421030,2976.55,Energy',
        '2024-03-01,TCS,4102.20,4155.00,4090.75,4140.30,2210544,4140.30,IT',
        '2024-03-01,HDFCBANK,1421.50,1438.90,1415.20,1432.10,9812770,1432.10,Financials',
        '2024-03-01,INFY,1655.00,1672.35,1648.10,1668.90,3345120,1668.90,IT',
        '2024-03-04,RELIANCE,2978.00,3005.60,2969.40,2998.25,6890215,2998.25,Energy',
        '2024-03-04,TCS,4142.00,4160.10,4118.00,4129.55,1987340,4129.55,IT',
        '2024-03-04,HDFCBANK,1433.00,1449.75,1428.60,1445.20,8730991,1445.20,Financials',
        '2024-03-04,INFY,1669.50,1681.00,1660.20,1663.75,2998410,1663.75,IT',
      ]
    ),
  },
  {
    slug: 'twitter-sentiment-corpus-tech-industry-2023',
    ext: 'json',
    contentType: 'application/json',
    content: json([
      { tweet_id: '1620045512', created_at: '2023-02-11T14:03:22Z', company: 'Apple', text: 'The new chip is genuinely impressive, battery life is unreal.', sentiment: 'positive', emotion_score: 0.82, retweets: 214, likes: 1890, verified: true },
      { tweet_id: '1620049981', created_at: '2023-02-11T14:20:10Z', company: 'Tesla', text: 'Delivery got delayed again. Not happy about this.', sentiment: 'negative', emotion_score: -0.61, retweets: 47, likes: 133, verified: false },
      { tweet_id: '1620051203', created_at: '2023-02-11T15:11:45Z', company: 'Microsoft', text: 'Copilot integration is fine, nothing groundbreaking yet.', sentiment: 'neutral', emotion_score: 0.05, retweets: 12, likes: 88, verified: false },
      { tweet_id: '1620060777', created_at: '2023-02-11T16:44:02Z', company: 'Nvidia', text: 'GPU prices finally dropping, great time to build.', sentiment: 'positive', emotion_score: 0.74, retweets: 331, likes: 2450, verified: true },
      { tweet_id: '1620071120', created_at: '2023-02-11T18:02:39Z', company: 'Meta', text: 'Another reorg? feels like every quarter now.', sentiment: 'negative', emotion_score: -0.44, retweets: 65, likes: 210, verified: false },
      { tweet_id: '1620088345', created_at: '2023-02-11T20:15:51Z', company: 'Google', text: 'Search results have been solid lately, credit where due.', sentiment: 'positive', emotion_score: 0.58, retweets: 29, likes: 176, verified: false },
    ]),
  },
  {
    slug: 'urban-traffic-camera-annotated-object-detection',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'frame_id,image_file,city,time_of_day,class_id,class_name,x_center,y_center,width,height',
      [
        'FR-000001,frames/berlin/000001.jpg,Berlin,day,2,car,0.4123,0.6210,0.1050,0.0880',
        'FR-000001,frames/berlin/000001.jpg,Berlin,day,0,pedestrian,0.7810,0.5540,0.0420,0.1600',
        'FR-000002,frames/berlin/000002.jpg,Berlin,day,3,bus,0.5200,0.4800,0.2400,0.2100',
        'FR-000010,frames/tokyo/000010.jpg,Tokyo,night,1,motorcycle,0.3300,0.7100,0.0600,0.0700',
        'FR-000010,frames/tokyo/000010.jpg,Tokyo,night,2,car,0.6050,0.6600,0.1200,0.0900',
        'FR-000011,frames/tokyo/000011.jpg,Tokyo,night,4,traffic_sign,0.1500,0.2200,0.0300,0.0450',
        'FR-000020,frames/nyc/000020.jpg,New York,day,0,pedestrian,0.2600,0.5900,0.0400,0.1500',
        'FR-000020,frames/nyc/000020.jpg,New York,day,2,car,0.8100,0.6300,0.1100,0.0850',
      ]
    ),
  },
  {
    slug: 'global-weather-stations-30-year-climate-records',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'station_id,date,country,latitude,longitude,temp_c,humidity_pct,precip_mm,wind_kph,uv_index,aqi',
      [
        'STN-US-0421,2024-06-01,US,40.7128,-74.0060,24.3,61,0.0,12.4,7,42',
        'STN-GB-0088,2024-06-01,GB,51.5074,-0.1278,17.8,72,2.1,18.9,4,35',
        'STN-AU-0310,2024-06-01,AU,-33.8688,151.2093,13.5,55,0.0,22.1,3,21',
        'STN-IN-0902,2024-06-01,IN,19.0760,72.8777,31.2,78,5.4,9.8,9,118',
        'STN-BR-0155,2024-06-01,BR,-23.5505,-46.6333,21.9,68,1.2,14.0,6,58',
        'STN-US-0421,2024-06-02,US,40.7128,-74.0060,25.1,58,0.0,10.2,8,47',
        'STN-GB-0088,2024-06-02,GB,51.5074,-0.1278,18.4,70,0.6,16.3,5,33',
        'STN-IN-0902,2024-06-02,IN,19.0760,72.8777,30.6,81,12.7,11.5,8,124',
      ]
    ),
  },
  {
    slug: 'retail-store-footfall-heatmap-data',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'store_id,date,zone,hour,footfall_count,avg_dwell_sec,conversion_rate,peak_flag',
      [
        'STORE-DEL-01,2024-10-12,Entrance,10,142,45,0.00,false',
        'STORE-DEL-01,2024-10-12,Apparel,11,98,210,0.18,false',
        'STORE-DEL-01,2024-10-12,Checkout,12,76,95,0.62,true',
        'STORE-MUM-04,2024-10-12,Electronics,13,54,340,0.24,false',
        'STORE-MUM-04,2024-10-12,Grocery,18,187,180,0.41,true',
        'STORE-BLR-07,2024-10-12,Entrance,19,220,50,0.00,true',
        'STORE-BLR-07,2024-10-12,Footwear,20,63,260,0.15,false',
        'STORE-DEL-01,2024-10-13,Apparel,11,110,225,0.20,false',
      ]
    ),
  },
  {
    slug: 'satellite-land-use-classification-south-asia',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'tile_id,file_name,country,capture_date,resolution_m,cloud_cover_pct,land_use_label,latitude,longitude',
      [
        'TILE-IN-00012,tiles/in/00012.tiff,IN,2023-11-04,10,3.2,urban,28.6139,77.2090',
        'TILE-IN-00013,tiles/in/00013.tiff,IN,2023-11-04,10,1.0,agricultural,26.9124,75.7873',
        'TILE-PK-00051,tiles/pk/00051.tiff,PK,2023-11-06,10,8.7,water,24.8607,67.0011',
        'TILE-BD-00088,tiles/bd/00088.tiff,BD,2023-11-09,10,12.4,forest,22.3569,91.7832',
        'TILE-LK-00104,tiles/lk/00104.tiff,LK,2023-11-11,10,5.5,agricultural,6.9271,79.8612',
        'TILE-IN-00120,tiles/in/00120.tiff,IN,2023-11-14,10,0.4,industrial,19.0760,72.8777',
      ]
    ),
  },
  {
    slug: 'customer-support-chat-logs-saas-industry',
    ext: 'json',
    contentType: 'application/json',
    content: json([
      {
        conversation_id: 'CONV-000112', company: 'SaaSCo-A', channel: 'web-chat', issue_category: 'billing',
        messages: [
          { sender: 'customer', text: 'I was charged twice this month.' },
          { sender: 'agent', text: 'Sorry about that — I can see the duplicate and will refund it now.' },
        ],
        resolution_status: 'resolved', csat_score: 5, agent_response_sec: 34,
      },
      {
        conversation_id: 'CONV-000119', company: 'SaaSCo-B', channel: 'email', issue_category: 'technical',
        messages: [
          { sender: 'customer', text: 'The export button does nothing on Safari.' },
          { sender: 'agent', text: 'Thanks for flagging — it is a known issue, a fix ships this week.' },
        ],
        resolution_status: 'pending', csat_score: 3, agent_response_sec: 512,
      },
      {
        conversation_id: 'CONV-000127', company: 'SaaSCo-A', channel: 'web-chat', issue_category: 'onboarding',
        messages: [
          { sender: 'customer', text: 'How do I invite my team?' },
          { sender: 'agent', text: 'Go to Settings > Members > Invite. Want me to send a walkthrough?' },
        ],
        resolution_status: 'resolved', csat_score: 4, agent_response_sec: 47,
      },
    ]),
  },
  {
    slug: 'radiology-chest-x-ray-screening-dataset',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'study_id,file_name,patient_age,sex,view_position,finding_labels,institution',
      [
        'STU-00001,xrays/00001.dcm,58,M,PA,Cardiomegaly|Effusion,Inst-A',
        'STU-00002,xrays/00002.dcm,44,F,AP,No Finding,Inst-A',
        'STU-00003,xrays/00003.dcm,67,M,PA,Pneumonia,Inst-B',
        'STU-00004,xrays/00004.dcm,71,F,PA,Effusion|Atelectasis,Inst-B',
        'STU-00005,xrays/00005.dcm,33,M,AP,No Finding,Inst-A',
        'STU-00006,xrays/00006.dcm,52,F,PA,Mass,Inst-C',
      ]
    ),
  },
  {
    slug: 'multilingual-chatbot-intent-corpus',
    ext: 'json',
    contentType: 'application/json',
    content: json([
      { utterance_id: 'UTT-0001', language: 'en', text: 'I want to cancel my order', intent: 'cancel_order', slots: { order_id: null }, confidence: 0.97 },
      { utterance_id: 'UTT-0002', language: 'es', text: 'Quiero cambiar mi dirección de envío', intent: 'update_address', slots: {}, confidence: 0.94 },
      { utterance_id: 'UTT-0003', language: 'fr', text: 'Où est mon colis ?', intent: 'track_order', slots: {}, confidence: 0.96 },
      { utterance_id: 'UTT-0004', language: 'de', text: 'Ich brauche eine Rechnung', intent: 'request_invoice', slots: {}, confidence: 0.91 },
      { utterance_id: 'UTT-0005', language: 'hi', text: 'मेरा रिफंड कब आएगा', intent: 'refund_status', slots: {}, confidence: 0.93 },
      { utterance_id: 'UTT-0006', language: 'en', text: 'reset my password please', intent: 'reset_password', slots: {}, confidence: 0.98 },
    ]),
  },
  {
    slug: 'warehouse-robot-navigation-logs',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'log_id,timestamp,robot_id,facility_id,x,y,heading_deg,velocity_mps,lidar_min_dist_m,obstacle_event,action',
      [
        'LOG-0000001,2024-05-02T08:00:01Z,RBT-14,FC-07,12.40,3.10,90,1.20,2.80,false,forward',
        'LOG-0000002,2024-05-02T08:00:02Z,RBT-14,FC-07,12.40,4.30,90,1.20,1.10,true,slow',
        'LOG-0000003,2024-05-02T08:00:03Z,RBT-14,FC-07,12.41,4.55,45,0.40,0.60,true,reroute',
        'LOG-0000004,2024-05-02T08:00:04Z,RBT-14,FC-07,13.10,4.90,0,0.90,3.40,false,forward',
        'LOG-0000005,2024-05-02T08:00:05Z,RBT-22,FC-11,4.00,9.80,180,1.50,4.10,false,forward',
        'LOG-0000006,2024-05-02T08:00:06Z,RBT-22,FC-11,3.20,9.80,180,1.50,0.90,true,stop',
        'LOG-0000007,2024-05-02T08:00:07Z,RBT-22,FC-11,3.20,9.80,270,0.00,0.90,true,wait',
      ]
    ),
  },
  {
    slug: 'credit-card-fraud-transaction-dataset',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'transaction_id,timestamp,amount,merchant_category,device_fingerprint,country,velocity_1h,is_fraud',
      [
        'CC-0000001,2024-07-01T11:02:30Z,42.10,grocery,fp_9a12,US,1,false',
        'CC-0000002,2024-07-01T11:04:12Z,1290.00,electronics,fp_ff03,GB,4,true',
        'CC-0000003,2024-07-01T11:09:45Z,7.99,coffee,fp_9a12,US,2,false',
        'CC-0000004,2024-07-01T11:15:03Z,850.00,jewelry,fp_7c88,CA,6,true',
        'CC-0000005,2024-07-01T11:20:51Z,63.40,apparel,fp_2b41,US,1,false',
        'CC-0000006,2024-07-01T11:31:22Z,2100.00,electronics,fp_ff03,GB,7,true',
        'CC-0000007,2024-07-01T11:42:10Z,15.20,transport,fp_5d10,US,1,false',
      ]
    ),
  },
  {
    slug: 'loan-default-risk-scoring-dataset',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'application_id,age,income,loan_amount,credit_score,employment_years,dti_ratio,prior_defaults,income_verified,default_outcome',
      [
        'LN-000001,34,72000,15000,712,6,0.28,0,true,repaid',
        'LN-000002,41,54000,22000,648,3,0.44,1,true,default',
        'LN-000003,29,38000,8000,690,2,0.31,0,false,repaid',
        'LN-000004,52,120000,40000,770,20,0.19,0,true,repaid',
        'LN-000005,45,47000,25000,602,8,0.52,2,true,default',
        'LN-000006,38,88000,18000,735,12,0.22,0,true,repaid',
      ]
    ),
  },
  {
    slug: 'medical-imaging-annotation-ct-mri-scans',
    ext: 'csv',
    contentType: 'text/csv',
    content: csv(
      'scan_id,file_name,modality,body_region,patient_age,sex,annotation_type,label,radiologist_verified',
      [
        'SCN-00001,scans/00001.dcm,CT,abdomen,60,M,segmentation,liver_tumor,true',
        'SCN-00002,scans/00002.dcm,MRI,brain,47,F,segmentation,glioma,true',
        'SCN-00003,scans/00003.dcm,CT,chest,55,M,boundary,lung_lobe,true',
        'SCN-00004,scans/00004.dcm,MRI,knee,31,F,boundary,cartilage,false',
        'SCN-00005,scans/00005.dcm,CT,abdomen,68,M,segmentation,kidney,true',
        'SCN-00006,scans/00006.dcm,MRI,brain,72,F,segmentation,meningioma,true',
      ]
    ),
  },
]

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`\nUploading dataset samples ${isDryRun ? '(DRY RUN)' : ''}...\n`)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const sample of samples) {
    if (SKIP_SLUGS.has(sample.slug)) {
      console.log(`  ⤼ SKIP ${sample.slug} (already has a manual sampleUrl)`)
      skipped++
      continue
    }

    const path = `samples/${sample.slug}.${sample.ext}`

    // The dataset must exist before we point its sampleUrl anywhere.
    const dataset = await prisma.dataset.findUnique({
      where: { slug: sample.slug },
      select: { id: true },
    })
    if (!dataset) {
      console.warn(`  ✗ no dataset row for slug "${sample.slug}" — skipping`)
      failed++
      continue
    }

    if (isDryRun) {
      console.log(`  [DRY RUN] would upload ${path} (${Buffer.byteLength(sample.content)} bytes) and set sampleUrl`)
      ok++
      continue
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(sample.content), {
        upsert: true,
        contentType: sample.contentType,
      })

    if (uploadError) {
      console.error(`  ✗ upload failed for ${path}: ${uploadError.message}`)
      failed++
      continue
    }

    const sampleUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

    await prisma.dataset.update({
      where: { slug: sample.slug },
      data: { sampleUrl },
    })

    console.log(`  ✓ ${sample.slug} → ${sampleUrl}`)
    ok++
  }

  console.log(`\nDone: ${ok} uploaded, ${skipped} skipped, ${failed} failed.`)
}

main()
  .catch((e) => {
    console.error('upload-samples failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
