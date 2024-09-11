// mockData.js

export const propertiesData = [
  {
    id: 1,
    name: "Sunset Villa",
    description: "A beautiful villa with a stunning sunset view.",
    establishmentDate: "2020-06-15",
    contractStartDate: "2023-01-01",
    contractEndDate: "2024-01-01",
    renter: {
      name: "John Doe",
      contact: "john.doe@example.com",
      phone: "123-456-7890",
    },
    location: [34.0522, -118.2437], // Los Angeles coordinates
    images: [
      "https://example.com/sunset-villa-1.jpg",
      "https://example.com/sunset-villa-2.jpg",
      "https://example.com/sunset-villa-3.jpg",
    ],
    propertyType: "Villa",
    rentAmount: 3500,
    additionalInfo: {
      area: 2500,
      bedrooms: 4,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 2,
    name: "Downtown Loft",
    description: "A modern loft in the heart of the city.",
    establishmentDate: "2019-03-10",
    contractStartDate: "2023-02-15",
    contractEndDate: "2024-02-15",
    renter: {
      name: "Jane Smith",
      contact: "jane.smith@example.com",
      phone: "987-654-3210",
    },
    location: [40.7128, -74.0060], // New York City coordinates
    images: [
      "https://example.com/downtown-loft-1.jpg",
      "https://example.com/downtown-loft-2.jpg",
    ],
    propertyType: "Apartment",
    rentAmount: 2800,
    additionalInfo: {
      area: 1200,
      bedrooms: 2,
      bathrooms: 2,
      furnished: false,
      parking: false,
    },
  },
  {
    id: 3,
    name: "Seaside Cottage",
    description: "A charming cottage with direct beach access.",
    establishmentDate: "2021-07-22",
    contractStartDate: "2023-06-01",
    contractEndDate: "2024-06-01",
    renter: {
      name: "Alice Johnson",
      contact: "alice.johnson@example.com",
      phone: "456-789-0123",
    },
    location: [33.7490, -118.1871], // Long Beach coordinates
    images: [
      "https://example.com/seaside-cottage-1.jpg",
      "https://example.com/seaside-cottage-2.jpg",
      "https://example.com/seaside-cottage-3.jpg",
    ],
    propertyType: "House",
    rentAmount: 4200,
    additionalInfo: {
      area: 1800,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 4,
    name: "Mountain Retreat",
    description: "A cozy cabin surrounded by nature.",
    establishmentDate: "2018-11-30",
    contractStartDate: "2023-04-01",
    contractEndDate: "2024-04-01",
    renter: {
      name: "Bob Wilson",
      contact: "bob.wilson@example.com",
      phone: "789-012-3456",
    },
    location: [39.7392, -104.9903], // Denver coordinates
    images: [
      "https://example.com/mountain-retreat-1.jpg",
      "https://example.com/mountain-retreat-2.jpg",
    ],
    propertyType: "Cabin",
    rentAmount: 2200,
    additionalInfo: {
      area: 1500,
      bedrooms: 2,
      bathrooms: 1,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 5,
    name: "Urban Penthouse",
    description: "A luxurious penthouse with city skyline views.",
    establishmentDate: "2022-01-15",
    contractStartDate: "2023-03-01",
    contractEndDate: "2024-03-01",
    renter: {
      name: "Emily Brown",
      contact: "emily.brown@example.com",
      phone: "234-567-8901",
    },
    location: [41.8781, -87.6298], // Chicago coordinates
    images: [
      "https://example.com/urban-penthouse-1.jpg",
      "https://example.com/urban-penthouse-2.jpg",
      "https://example.com/urban-penthouse-3.jpg",
    ],
    propertyType: "Penthouse",
    rentAmount: 5500,
    additionalInfo: {
      area: 3000,
      bedrooms: 3,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 6,
    name: "Suburban Family Home",
    description: "A spacious home perfect for families.",
    establishmentDate: "2017-09-05",
    contractStartDate: "2023-07-01",
    contractEndDate: "2024-07-01",
    renter: {
      name: "Michael Davis",
      contact: "michael.davis@example.com",
      phone: "345-678-9012",
    },
    location: [47.6062, -122.3321], // Seattle coordinates
    images: [
      "https://example.com/suburban-home-1.jpg",
      "https://example.com/suburban-home-2.jpg",
    ],
    propertyType: "House",
    rentAmount: 3800,
    additionalInfo: {
      area: 2800,
      bedrooms: 4,
      bathrooms: 3,
      furnished: false,
      parking: true,
    },
  },
  {
    id: 7,
    name: "Eco-friendly Tiny House",
    description: "A sustainable tiny house with modern amenities.",
    establishmentDate: "2023-02-28",
    contractStartDate: "2023-05-01",
    contractEndDate: "2024-05-01",
    renter: {
      name: "Sarah Green",
      contact: "sarah.green@example.com",
      phone: "567-890-1234",
    },
    location: [30.2672, -97.7431], // Austin coordinates
    images: [
      "https://example.com/tiny-house-1.jpg",
      "https://example.com/tiny-house-2.jpg",
    ],
    propertyType: "Tiny House",
    rentAmount: 1500,
    additionalInfo: {
      area: 400,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      parking: false,
    },
  },
  {
    id: 8,
    name: "Historic Brownstone",
    description: "A classic brownstone with modern updates.",
    establishmentDate: "2016-12-10",
    contractStartDate: "2023-08-15",
    contractEndDate: "2024-08-15",
    renter: {
      name: "David Miller",
      contact: "david.miller@example.com",
      phone: "678-901-2345",
    },
    location: [42.3601, -71.0589], // Boston coordinates
    images: [
      "https://example.com/historic-brownstone-1.jpg",
      "https://example.com/historic-brownstone-2.jpg",
      "https://example.com/historic-brownstone-3.jpg",
    ],
    propertyType: "Townhouse",
    rentAmount: 4000,
    additionalInfo: {
      area: 2200,
      bedrooms: 3,
      bathrooms: 2,
      furnished: false,
      parking: false,
    },
  },
];