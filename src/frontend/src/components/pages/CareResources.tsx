import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Clock, Search, User, X } from "lucide-react";
import { useMemo, useState } from "react";

type Category =
  | "Fall Prevention"
  | "Medication Safety"
  | "Mental Health"
  | "Dementia Care"
  | "Exercise & Mobility"
  | "Nutrition";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  readTime: string;
  author: string;
  publishedDate: string;
  accentColor: string;
}

const CATEGORIES: Category[] = [
  "Fall Prevention",
  "Medication Safety",
  "Mental Health",
  "Dementia Care",
  "Exercise & Mobility",
  "Nutrition",
];

const CATEGORY_COLORS: Record<Category, string> = {
  "Fall Prevention": "#f59e0b",
  "Medication Safety": "#3b82f6",
  "Mental Health": "#8b5cf6",
  "Dementia Care": "#ec4899",
  "Exercise & Mobility": "#10b981",
  Nutrition: "#f97316",
};

const ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Preventing Falls at Home",
    excerpt:
      "Practical strategies to reduce fall risk in older adults, including home modifications and exercise routines.",
    content:
      "Falls are the leading cause of injury in older Australians.\n\nKey prevention strategies include:\n\n• Remove trip hazards such as loose rugs, clutter, and cords from walkways.\n• Install grab rails in bathrooms and along staircases.\n• Ensure adequate lighting in all rooms, especially hallways and stairs.\n• Wear non-slip footwear at all times, even indoors.\n• Exercise regularly — programs like Tai Chi and strength training significantly reduce fall risk.\n• Have vision and hearing checked annually.\n• Review medications with a pharmacist, as some drugs increase dizziness or unsteadiness.\n\nSpeak to your GP or an occupational therapist for a personalised home safety assessment.",
    category: "Fall Prevention",
    readTime: "5 min",
    author: "Dr. Sarah Mitchell",
    publishedDate: "2026-01-15",
    accentColor: "#f59e0b",
  },
  {
    id: "a2",
    title: "Understanding Medication Interactions",
    excerpt:
      "How multiple medications can interact and what older adults and carers need to know to stay safe.",
    content:
      "Many older Australians take five or more medications daily — a condition known as polypharmacy.\n\nCommon risks include:\n\n• Drug-drug interactions: some medications reduce or amplify each other's effects.\n• Drug-food interactions: for example, grapefruit juice affects certain heart and cholesterol medications.\n• Increased sensitivity: older bodies process drugs more slowly, raising the risk of side effects.\n\nWhat you can do:\n\n1. Keep a current medication list and share it with every health provider.\n2. Request a Home Medicines Review (HMR) from your GP — a pharmacist visits your home and reviews all your medicines.\n3. Never stop or change doses without medical advice.\n4. Use a dosette box to organise daily medications.\n\nThe ACRM Medication Safety portal links to the NPS MedicineWise resources for further guidance.",
    category: "Medication Safety",
    readTime: "7 min",
    author: "Pharmacist Kira Nguyen",
    publishedDate: "2026-01-28",
    accentColor: "#3b82f6",
  },
  {
    id: "a3",
    title: "Managing Depression in Aged Care",
    excerpt:
      "Recognising the signs of depression in older adults and evidence-based approaches for care and support.",
    content:
      "Depression affects approximately 1 in 4 aged care residents, yet it is frequently under-recognised and under-treated.\n\nWarning signs:\n\n• Persistent sadness or low mood for more than two weeks.\n• Loss of interest in activities previously enjoyed.\n• Changes in sleep, appetite, or weight.\n• Fatigue, concentration difficulties, or feelings of worthlessness.\n\nApproaches that help:\n\n• Regular social engagement and structured daily activities.\n• Talking therapies such as Cognitive Behavioural Therapy (CBT).\n• Physical activity, even gentle seated exercise.\n• Appropriate medication where recommended by a GP or psychiatrist.\n\nCarers play a vital role. Listening without judgment and encouraging help-seeking are powerful first steps. Contact Beyond Blue (1300 22 4636) or Lifeline (13 11 14) for immediate support.",
    category: "Mental Health",
    readTime: "6 min",
    author: "Psychologist Dr. James Okafor",
    publishedDate: "2026-02-10",
    accentColor: "#8b5cf6",
  },
  {
    id: "a4",
    title: "Early Signs of Dementia",
    excerpt:
      "What to look for in early-stage dementia and how families and carers can support timely diagnosis.",
    content:
      "Early detection of dementia allows people to plan for the future while they still have capacity.\n\nEarly warning signs:\n\n• Frequent memory lapses, particularly for recent events.\n• Difficulty finding words or following conversations.\n• Getting lost in familiar places.\n• Problems with planning, judgement, or decision-making.\n• Changes in mood or personality.\n\nSteps to take:\n\n1. See your GP early — many causes of confusion are treatable.\n2. Request a cognitive assessment (e.g., the MMSE or MoCA test).\n3. Contact Dementia Australia (1800 100 500) for information and carer support groups.\n4. Consider legal and financial planning while the person has legal capacity.\n\nAustralia has a growing network of Memory Clinics — ask your GP for a referral.",
    category: "Dementia Care",
    readTime: "8 min",
    author: "Dr. Helen Walsh",
    publishedDate: "2026-02-20",
    accentColor: "#ec4899",
  },
  {
    id: "a5",
    title: "Chair Exercises for Seniors",
    excerpt:
      "Simple, safe exercises that can be performed from a chair to maintain strength, flexibility, and balance.",
    content:
      "Regular physical activity is one of the most effective ways to maintain independence and quality of life in older age.\n\nChair-based exercises are ideal for those with limited mobility:\n\n• Seated marching: lift knees alternately for 30 seconds to improve circulation.\n• Arm circles: rotate arms forward and backward to maintain shoulder mobility.\n• Ankle pumps: flex and point feet to reduce swelling and clot risk.\n• Seated torso twist: gently rotate your upper body left and right to improve flexibility.\n• Chair sit-to-stand: practise standing up from a chair without using hands to build leg strength.\n\nAim for at least 30 minutes of gentle movement most days. Always consult your physiotherapist or GP before starting a new exercise program.",
    category: "Exercise & Mobility",
    readTime: "4 min",
    author: "Physiotherapist Anya Petrov",
    publishedDate: "2026-03-02",
    accentColor: "#10b981",
  },
  {
    id: "a6",
    title: "Nutrition for Healthy Ageing",
    excerpt:
      "How nutritional needs change with age and practical tips to maintain a balanced, nourishing diet.",
    content:
      "Good nutrition becomes more important — and sometimes more challenging — as we age.\n\nKey nutritional changes in older adults:\n\n• Calorie needs often decrease, but protein, calcium, and vitamin D requirements increase.\n• Appetite may diminish due to medications, dental problems, or reduced social eating.\n• Hydration: older adults have a reduced thirst sensation; aim for 8 cups of fluid daily.\n\nPractical tips:\n\n1. Prioritise protein at every meal — eggs, legumes, lean meat, dairy, and fish.\n2. Include calcium-rich foods (dairy, fortified plant milks, tofu, leafy greens) for bone health.\n3. Get vitamin D through safe sun exposure and foods such as oily fish and fortified cereals.\n4. Choose fibre-rich foods to support digestion — wholegrains, fruits, and vegetables.\n5. Limit processed foods, added sugar, and sodium.\n\nConsider a referral to a dietitian if you have difficulty maintaining a healthy weight or managing a chronic condition through diet.",
    category: "Nutrition",
    readTime: "5 min",
    author: "Dietitian Sophie Lam",
    publishedDate: "2026-03-12",
    accentColor: "#f97316",
  },
  {
    id: "a7",
    title: "Hip Fracture Recovery Guide",
    excerpt:
      "What to expect after a hip fracture and how rehabilitation, nutrition, and home support accelerate recovery.",
    content:
      "Hip fractures are one of the most serious consequences of falls in older adults, often requiring surgery and extended rehabilitation.\n\nThe recovery journey typically includes:\n\n• Acute hospital care (3–7 days post-surgery).\n• Inpatient rehabilitation (2–6 weeks) — physiotherapy, occupational therapy, and nursing care.\n• Return home with community supports — home care packages, aids and equipment.\n\nKey recovery factors:\n\n1. Early mobilisation (often within 24 hours of surgery) significantly improves outcomes.\n2. Protein and calcium intake supports bone healing.\n3. Vitamin D and bisphosphonate therapy may be prescribed to prevent future fractures.\n4. Falls risk assessment before discharge to minimise re-fracture risk.\n5. Psychological support — depression and fear of falling are common post-fracture.\n\nAsk your care team about a Fracture Liaison Service (FLS) for ongoing bone health management.",
    category: "Fall Prevention",
    readTime: "6 min",
    author: "Orthopaedic Nurse Lisa Carey",
    publishedDate: "2026-03-18",
    accentColor: "#f59e0b",
  },
  {
    id: "a8",
    title: "Reducing Social Isolation in Older Adults",
    excerpt:
      "Practical ways to build connection and community for older Australians at risk of loneliness.",
    content:
      "Social isolation is a significant risk factor for both mental and physical decline in older adults.\n\nConsequences of chronic loneliness:\n\n• Increased risk of depression, anxiety, and cognitive decline.\n• Higher rates of cardiovascular disease and reduced immune function.\n• Greater likelihood of premature death.\n\nStrategies to build connection:\n\n1. Join a local seniors centre, men's shed, or walking group.\n2. Enrol in community education classes — art, music, language, or technology.\n3. Volunteer — giving back provides purpose and social interaction.\n4. Use technology — video calls, social media groups, and online communities.\n5. Consider pet ownership; animals provide companionship and routine.\n\nFor those in residential care, person-centred activity programs tailored to individual interests are linked to reduced loneliness and improved wellbeing.",
    category: "Mental Health",
    readTime: "5 min",
    author: "Social Worker Maria Santos",
    publishedDate: "2026-03-22",
    accentColor: "#8b5cf6",
  },
  {
    id: "a9",
    title: "Managing Chronic Pain in Aged Care",
    excerpt:
      "Evidence-based non-pharmacological approaches to chronic pain management for older adults.",
    content:
      "Chronic pain affects up to 80% of aged care residents, yet it is often inadequately managed.\n\nNon-medication approaches with good evidence:\n\n• Heat therapy: warm packs or heated blankets for arthritic or muscular pain.\n• Transcutaneous electrical nerve stimulation (TENS).\n• Gentle exercise and physiotherapy.\n• Cognitive Behavioural Therapy (CBT) adapted for pain management.\n• Mindfulness and relaxation techniques.\n\nMedication considerations:\n\n• Paracetamol remains first-line for mild to moderate pain in older adults.\n• NSAIDs (e.g., ibuprofen) carry significant risks in older people — use with caution.\n• Opioids should be used at the lowest effective dose with regular review.\n\nA pain management plan developed with your GP or pain specialist should combine multiple approaches for the best outcomes.",
    category: "Exercise & Mobility",
    readTime: "6 min",
    author: "Dr. Paul Chambers",
    publishedDate: "2026-03-25",
    accentColor: "#10b981",
  },
  {
    id: "a10",
    title: "Caring for Someone with Dementia at Home",
    excerpt:
      "Practical guidance for family carers supporting a loved one with dementia at home.",
    content:
      "Home-based care for a person with dementia can be deeply rewarding but also exhausting.\n\nEstablishing a supportive environment:\n\n• Maintain familiar routines to reduce confusion and anxiety.\n• Simplify the home environment — remove clutter, lock away dangerous items.\n• Use clear labels and visual cues (e.g., photos on cupboard doors).\n\nCommunication strategies:\n\n1. Use short, simple sentences and allow extra time for responses.\n2. Avoid arguing or correcting — join the person's reality where safe.\n3. Non-verbal communication (touch, eye contact, tone) becomes increasingly important.\n\nCarer wellbeing:\n\n• Access respite care through the Commonwealth Home Support Programme (CHSP) or a Home Care Package.\n• Connect with Dementia Australia's Carer Support Groups.\n• Speak to your GP about carer assessment and support services.\n\nYou cannot provide good care without looking after yourself first.",
    category: "Dementia Care",
    readTime: "9 min",
    author: "Carer Advocate Tom Wu",
    publishedDate: "2026-03-28",
    accentColor: "#ec4899",
  },
  {
    id: "a11",
    title: "Healthy Ageing Through Strength Training",
    excerpt:
      "Why resistance exercise is critical for older adults and how to get started safely.",
    content:
      "After age 60, adults lose 1–2% of muscle mass per year (sarcopenia), leading to weakness, falls, and loss of independence.\n\nBenefits of strength training:\n\n• Maintains muscle mass and functional strength.\n• Improves bone density, reducing osteoporosis risk.\n• Enhances balance and reduces falls risk.\n• Supports metabolic health and blood sugar regulation.\n\nGetting started safely:\n\n1. Begin with bodyweight exercises — wall push-ups, sit-to-stand, calf raises.\n2. Use resistance bands before progressing to weights.\n3. Aim for 2–3 sessions per week with a rest day between each.\n4. Work with a physiotherapist or accredited exercise physiologist (AEP) initially.\n5. Progress gradually — a 10% increase in resistance per week is appropriate.\n\nStrength training is safe for most older adults, including those with chronic conditions, when supervised appropriately.",
    category: "Exercise & Mobility",
    readTime: "5 min",
    author: "Exercise Physiologist Ben Clarke",
    publishedDate: "2026-03-30",
    accentColor: "#10b981",
  },
  {
    id: "a12",
    title: "Safe Food Handling for Older Adults",
    excerpt:
      "Why older adults are at higher risk of foodborne illness and how to stay safe in the kitchen.",
    content:
      "Older adults are more vulnerable to foodborne illness because the immune system, kidneys, and digestive tract function less efficiently with age.\n\nHigh-risk foods to handle with extra care:\n\n• Raw or undercooked meat, poultry, and seafood.\n• Soft cheeses, deli meats, and smoked fish (listeria risk).\n• Raw sprouts and unpasteurised dairy products.\n• Pre-prepared salads and ready-to-eat foods past their use-by date.\n\nSafe food handling practices:\n\n1. Refrigerate food promptly — never leave cooked food at room temperature for more than 2 hours.\n2. Cook meat to safe internal temperatures (e.g., 75°C for poultry).\n3. Store raw meat on the bottom shelf of the refrigerator.\n4. Wash hands for at least 20 seconds before and after handling food.\n5. Keep fridge temperature at or below 5°C.\n\nFood safety is especially important for those with diabetes, kidney disease, or compromised immunity.",
    category: "Nutrition",
    readTime: "4 min",
    author: "Environmental Health Officer Rachel Park",
    publishedDate: "2026-04-02",
    accentColor: "#f97316",
  },
];

const CARD_STYLE = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)" as const,
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "16px",
  color: "white" as const,
  overflow: "hidden" as const,
};

export default function CareResources() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat =
        activeCategory === "All" || a.category === activeCategory;
      const matchSearch =
        search === "" ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div
      style={{
        background: "#0a0f1e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1a2d5a 50%, #0d1540 100%)",
          padding: "40px 32px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <BookOpen size={20} color="#3b82f6" />
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              Care Resources
            </h1>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Evidence-based articles to help you and your family navigate aged
            care with confidence.
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Search + filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1", minWidth: "220px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.35)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              data-ocid="resources.search_input"
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                fontSize: "13px",
                outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          {(["All", ...CATEGORIES] as (Category | "All")[]).map((cat) => {
            const isActive = activeCategory === cat;
            const color =
              cat === "All" ? "#3b82f6" : CATEGORY_COLORS[cat as Category];
            return (
              <button
                key={cat}
                type="button"
                data-ocid={`resources.category.${cat.toLowerCase().replace(/ &/g, "").replace(/ /g, "_")}.tab`}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: `1px solid ${isActive ? `${color}60` : "rgba(255,255,255,0.10)"}`,
                  background: isActive ? `${color}18` : "transparent",
                  color: isActive ? color : "rgba(255,255,255,0.45)",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Article grid */}
        {filtered.length === 0 ? (
          <div
            data-ocid="resources.empty_state"
            style={{
              ...CARD_STYLE,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <BookOpen
              size={40}
              color="rgba(255,255,255,0.2)"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
              No articles found. Try a different search or category.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "18px",
            }}
          >
            {filtered.map((article, idx) => (
              <div
                key={article.id}
                data-ocid={`resources.item.${idx + 1}`}
                style={{
                  ...CARD_STYLE,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Top color strip */}
                <div
                  style={{
                    height: "4px",
                    background: `linear-gradient(90deg, ${article.accentColor}, ${article.accentColor}80)`,
                  }}
                />
                <div
                  style={{
                    padding: "20px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Category chip */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background: `${CATEGORY_COLORS[article.category]}18`,
                      border: `1px solid ${CATEGORY_COLORS[article.category]}40`,
                      fontSize: "10px",
                      fontWeight: 700,
                      color: CATEGORY_COLORS[article.category],
                      marginBottom: "12px",
                      letterSpacing: "0.04em",
                      width: "fit-content",
                    }}
                  >
                    {article.category}
                  </div>

                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "8px",
                      lineHeight: 1.35,
                      flex: 0,
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.6,
                      flex: 1,
                      marginBottom: "16px",
                    }}
                  >
                    {article.excerpt}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "auto",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        <Clock size={11} /> {article.readTime} read
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        <User size={11} />{" "}
                        {article.author.split(" ").slice(-1)[0]}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      data-ocid={`resources.read_article.button.${idx + 1}`}
                      onClick={() => setSelectedArticle(article)}
                      style={{
                        fontSize: "11px",
                        background: `${article.accentColor}18`,
                        color: article.accentColor,
                        border: `1px solid ${article.accentColor}40`,
                        fontWeight: 700,
                      }}
                    >
                      Read Article
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article detail dialog */}
      <Dialog
        open={!!selectedArticle}
        onOpenChange={() => setSelectedArticle(null)}
      >
        <DialogContent
          data-ocid="resources.article.dialog"
          style={{
            background: "#0f1b35",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedArticle && (
            <>
              <DialogHeader>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: `${CATEGORY_COLORS[selectedArticle.category]}18`,
                    border: `1px solid ${CATEGORY_COLORS[selectedArticle.category]}40`,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: CATEGORY_COLORS[selectedArticle.category],
                    marginBottom: "8px",
                    width: "fit-content",
                  }}
                >
                  {selectedArticle.category}
                </div>
                <DialogTitle style={{ color: "#fff", lineHeight: 1.3 }}>
                  {selectedArticle.title}
                </DialogTitle>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                  <span
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                  >
                    <Clock
                      size={10}
                      style={{ display: "inline", marginRight: "4px" }}
                    />
                    {selectedArticle.readTime} read
                  </span>
                  <span
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                  >
                    {selectedArticle.author}
                  </span>
                  <span
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}
                  >
                    {new Date(selectedArticle.publishedDate).toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              </DialogHeader>
              <div
                style={{
                  marginTop: "16px",
                  fontSize: "13.5px",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.75)",
                  whiteSpace: "pre-line",
                }}
              >
                {selectedArticle.content}
              </div>
              <div style={{ marginTop: "20px" }}>
                <Button
                  data-ocid="resources.article.close_button"
                  onClick={() => setSelectedArticle(null)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
