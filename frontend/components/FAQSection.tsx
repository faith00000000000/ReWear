const faqs = [
  {
    question: "Are the thrift pieces actually one-of-a-kind?",
    answer:
      "Yes. Most pieces are single-stock finds, restored and photographed individually before they go live.",
  },
  {
    question: "How does renting work?",
    answer:
      "Choose a look, pick your rental dates, wear it, then return it with the included prepaid label.",
  },
  {
    question: "What condition are second-hand pieces in?",
    answer:
      "Every item is inspected, steamed, and graded. We only list pieces we would happily wear ourselves.",
  },
  {
    question: "How do donations work?",
    answer:
      "Request a free label, pack your clean clothing, and we route each piece to resale, shelter partners, or responsible recycling.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "We currently ship in the United States, with international shipping planned for future drops.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-[#FAF2E6] px-7 py-16 sm:px-12 lg:px-24">
      <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[0.42fr_1fr]">
        <div>
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.32em] text-[#b49d89]">
            Good to know
          </p>
          <h2 className="text-[38px] font-black leading-[0.95] tracking-[-0.035em] text-[#1b1110] sm:text-[48px] [font-family:Georgia,serif]">
            Frequently
            <br />
            <span className="italic text-[#AC1B18] [font-family:cursive]">
              asked.
            </span>
          </h2>
          <p className="mt-5 max-w-[260px] text-[13px] font-medium leading-6 text-[#756b61]">
            Everything about buying, renting, donating, and rewearing with less
            waste.
          </p>
        </div>

        <div className="border-t border-[#d7cbbb]">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-[#d7cbbb] py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[15px] font-black text-[#2a1d18] marker:hidden">
                {faq.question}
                <span className="text-xl leading-none text-[#AC1B18] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[760px] text-[14px] font-medium leading-7 text-[#6f665c]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
