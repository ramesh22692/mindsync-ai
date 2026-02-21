import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/faqs`);
        setFaqs(response.data);
        setFilteredFaqs(response.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaqs(faqs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
      setFilteredFaqs(filtered);
    }
  }, [searchQuery, faqs]);

  return (
    <div className="bg-background min-h-screen" data-testid="faq-page">
      {/* Hero Section */}
      <section className="section-padding bg-slate-50 subtle-mesh">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-6">
            <HelpCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to common questions about our services, booking, and policies.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full"
              data-testid="faq-search-input"
            />
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No questions found matching your search.
              </p>
              <Button 
                variant="link" 
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-xl border border-border px-6 data-[state=open]:border-primary/30"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-8">
            Can't find what you're looking for? Our AI receptionist can help with quick 
            questions, or you can reach out to us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-secondary"
              onClick={() => document.querySelector('[data-testid="chat-open-btn"]')?.click()}
              data-testid="faq-chat-btn"
            >
              Ask AI Receptionist
            </Button>
            <Link to="/contact">
              <Button className="btn-primary gap-2">
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
