import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const CATEGORIES = ["About Donation", "Eligibility", "Process", "Safety"];

const FAQ_DATA = {
  "About Donation": [
    {
      q: "Why is blood donation so important in Bangladesh?",
      a: "Bangladesh needs over a million bags of blood every year, largely for thalassemia patients, surgeries, and emergencies. Voluntary donors help close the gap and reduce reliance on paid or family-replacement donors.",
    },
    {
      q: "How often can I donate blood?",
      a: "A healthy adult can safely donate whole blood once every four months. This gap gives your body enough time to replenish red blood cells and iron stores.",
    },
    {
      q: "Does donating blood have any health benefits?",
      a: "Yes. Regular donation includes a free basic health check and blood group confirmation, and many donors report feeling good about helping their community.",
    },
    {
      q: "Can I choose who receives my blood?",
      a: "For voluntary donations to a blood bank, blood goes to whoever needs it most. Through BloodConnect you can also respond directly to a specific patient's request.",
    },
    {
      q: "Is there any cost to donate blood?",
      a: "No. Donating blood is completely free, and voluntary donation should never involve payment. BloodConnect connects patients and donors at no charge.",
    },
  ],
  Eligibility: [
    {
      q: "What is the minimum age and weight to donate?",
      a: "You must be at least 18 years old and weigh a minimum of 50 kg (about 110 lbs) to donate blood safely in Bangladesh.",
    },
    {
      q: "Can I donate if I have low haemoglobin?",
      a: "You need a haemoglobin level of at least 12.5 g/dL. Eating iron-rich foods like daal, liver, and leafy shak beforehand can help.",
    },
    {
      q: "Can I donate during Ramadan while fasting?",
      a: "Yes, but it is best to donate after iftar when you are hydrated and have eaten. Avoid donating during the peak heat of the day while fasting.",
    },
    {
      q: "I recently had a fever or took antibiotics. Can I donate?",
      a: "Please wait until you have fully recovered and finished any course of antibiotics, typically at least one to two weeks after symptoms resolve.",
    },
    {
      q: "Can pregnant or breastfeeding women donate?",
      a: "Pregnant women should not donate. Breastfeeding mothers are generally advised to wait until the baby is weaned or as advised by their doctor.",
    },
  ],
  Process: [
    {
      q: "How long does the whole donation take?",
      a: "The actual blood collection takes about 8 to 10 minutes. Including registration, screening, and rest, plan for around 30 to 45 minutes.",
    },
    {
      q: "What should I do before donating?",
      a: "Eat a proper meal, drink plenty of water, get a good night's sleep, and bring a valid photo ID such as your NID or passport.",
    },
    {
      q: "Does donating blood hurt?",
      a: "You will feel a brief pinch when the needle is inserted, but most donors describe the process as quick and comfortable.",
    },
    {
      q: "What happens right after I donate?",
      a: "You will rest for 10 to 15 minutes with a light snack and drink. Avoid heavy lifting or intense exercise for the rest of the day.",
    },
    {
      q: "How do I respond to a blood request on BloodConnect?",
      a: "When you receive an alert matching your blood group and location, tap to confirm your availability, then coordinate with the requester or hospital.",
    },
  ],
  Safety: [
    {
      q: "Is it safe to donate blood?",
      a: "Absolutely. Sterile, single-use needles and equipment are used for every donor, so there is no risk of catching an infection from donating.",
    },
    {
      q: "Is my personal information kept private?",
      a: "Yes. BloodConnect only shares the contact details needed to complete a donation, and you control when you make yourself available.",
    },
    {
      q: "Will donating make me weak or anaemic?",
      a: "For a healthy donor, the body replaces the donated volume within a day or two and red cells within a few weeks, so it does not cause lasting weakness.",
    },
    {
      q: "How is donated blood tested for safety?",
      a: "Every unit is screened for infections such as HIV, hepatitis B and C, syphilis, and malaria before it can be used for a patient.",
    },
    {
      q: "What if I feel dizzy after donating?",
      a: "Sit or lie down, drink fluids, and rest. Dizziness usually passes quickly. Inform the staff or a nearby volunteer if it does not improve.",
    },
  ],
};

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("About Donation");
  const [openItem, setOpenItem] = useState(null);

  const searching = search.trim().length > 0;

  let items;
  if (searching) {
    const term = search.toLowerCase();
    items = [];
    CATEGORIES.forEach((cat) => {
      FAQ_DATA[cat].forEach((item, idx) => {
        if (
          item.q.toLowerCase().includes(term) ||
          item.a.toLowerCase().includes(term)
        ) {
          items.push({ ...item, key: `${cat}-${idx}`, category: cat });
        }
      });
    });
  } else {
    items = FAQ_DATA[activeCategory].map((item, idx) => ({
      ...item,
      key: `${activeCategory}-${idx}`,
      category: activeCategory,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Everything you need to know before donating or requesting blood in
          Bangladesh.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <Input
          leftIcon={Search}
          placeholder="Search questions..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpenItem(null);
          }}
        />
      </div>

      {!searching && (
        <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex flex-wrap gap-6">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenItem(null);
                  }}
                  className={
                    active
                      ? "pb-3 text-sm font-medium text-red-600 border-b-2 border-red-600"
                      : "pb-3 text-sm font-medium text-gray-500 dark:text-slate-400 border-b-2 border-transparent"
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-slate-400 py-12">
            No questions matched your search.
          </p>
        ) : (
          items.map((item) => {
            const isOpen = openItem === item.key;
            return (
              <div
                key={item.key}
                className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setOpenItem(isOpen ? null : item.key)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-slate-100">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`size-5 text-gray-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-slate-400">
                    {searching && (
                      <p className="text-xs text-red-600 mb-1">
                        {item.category}
                      </p>
                    )}
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        <div className="rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-6 text-center">
          <HelpCircle className="size-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">
            Still have questions?
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            Our team is here to help you donate or find blood safely.
          </p>
          <div className="mt-4">
            <Button as={Link} to="/contact" variant="primary">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
