export const phone = {
  display: "206.381.0732",
  tel: "tel:2063810732",
};

export const fax = "206.381.0513";

const GOOGLE_PLACE_ID = "ChIJf2vOKoYUkFQRj-vIo3pM35w";

export const reviews = {
  google: {
    rating: 4.9,
    count: 543,
    // Google reviews listing for this place (not the business profile share page).
    url: `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`,
    label: "Google",
  },
} as const;

export const seattleMetYears = [
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const officeHours = [
  { day: "Monday", hours: "7:00 am – 3:00 pm" },
  { day: "Tuesday", hours: "7:00 am – 3:00 pm" },
  { day: "Wednesday", hours: "7:00 am – 3:00 pm" },
  { day: "Thursday", hours: "7:00 am – 3:00 pm" },
  { day: "Friday", hours: "Closed" },
] as const;

const address = "4915 25th Ave NE, Suite 107, Seattle, WA 98105";

export const location = {
  address,
  addressDisplay: "4915 25th Ave NE, Suite 107, Seattle, WA 98105",
  parkingNote:
    "Located in Northcut Landing's West building with onsite underground parking.",
  mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  googlePlacesUrl: `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`,
  /**
   * Maps embed pinned to the Google Business Profile.
   * Uses the place feature id (not place_id:… alone — that falls back to a world map).
   */
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2685.5!2d-122.301916!3d47.665002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549014862ace6b7f%3A0x9cdf4c7aa3c8eb8f!2snew32%20Cosmetic%20and%20Family%20Dentistry!5e0!3m2!1sen!2sus!4v1720000000000",
};

export const lastUpdated = "May 2026";

export const featuredQuotes = [
  {
    text: "I genuinely look forward to my dental visits, which was unimaginable to me before coming here.",
    attribution: "Carolyn K., Google review",
  },
  {
    text: "The dentists are highly experienced, competent and empathetic. I highly recommend New32.",
    attribution: "Jon C., Google review",
  },
] as const;
