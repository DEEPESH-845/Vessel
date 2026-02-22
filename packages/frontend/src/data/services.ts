/**
 * Services Data
 * Content for the Services carousel slides
 */

export interface Service {
  id: number;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    id: 1,
    title: "Exhibitions & Events",
    description: "We organize high-profile exhibitions and events, connecting projects with government bodies, investment funds, and influencers in the crypto space.",
  },
  {
    id: 2,
    title: "Content Creation",
    description: "We produce detailed reports, threads, podcasts, and innovative visual content to engage various segments of the Arab community, educating and inspiring them about the potential of the digital economy.",
  },
  {
    id: 3,
    title: "Comprehensive Marketing & Advertising",
    description: "We specialize in designing integrated marketing experiences that connect all key stakeholders, from early investors to project execution and post-launch marketing.",
  },
  {
    id: 4,
    title: "Community Growth",
    description: "Building and nurturing engaged communities across Arabic-speaking regions through targeted strategies and authentic content.",
  },
  {
    id: 5,
    title: "Strategic Consulting",
    description: "Expert guidance for Web3 and crypto projects entering the MENA market, from tokenomics to go-to-market strategy.",
  },
];