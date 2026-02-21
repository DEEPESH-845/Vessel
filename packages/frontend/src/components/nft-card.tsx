/**
 * NFTCard Component
 * Displays individual NFT with lazy-loaded image, name, collection, and floor price
 * Requirements: FR-11.5
 */

"use client";

import { motion } from "framer-motion";
import { UnifiedAsset, NFTMetadata } from "@/types/multi-chain.types";
import { useState } from "react";

interface NFTCardProps {
  asset: UnifiedAsset;
  onImageClick?: (asset: UnifiedAsset) => void;
}

export default function NFTCard({ asset, onImageClick }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const metadata = asset.metadata as NFTMetadata;

  // Format floor price
  const formatFloorPrice = (price?: number) => {
    if (!price) return null;
    if (price < 0.01) return "< 0.01 ETH";
    if (price < 1) return `${price.toFixed(3)} ETH`;
    return `${price.toFixed(2)} ETH`;
  };

  const floorPrice = formatFloorPrice(metadata.floorPrice);

  // Get marketplace URL (OpenSea as default)
  const getMarketplaceUrl = () => {
    const chainSlug = getChainSlug(asset.chainId);
    return `https://opensea.io/assets/${chainSlug}/${metadata.contractAddress}/${metadata.tokenId}`;
  };

  // Handle image click
  const handleImageClick = () => {
    onImageClick?.(asset);
  };

  // Handle marketplace link click
  const handleMarketplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getMarketplaceUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: "#18181B",
        border: `1px solid ${isHovered ? "#CCFF00" : "#27272A"}`,
      }}
    >
      {/* NFT Image */}
      <div
        className="relative aspect-square overflow-hidden"
        onClick={handleImageClick}
      >
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "#27272A" }}
          />
        )}

        {/* Error state */}
        {imageError && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "#27272A" }}
          >
            <div className="text-center p-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="mx-auto mb-2 opacity-50"
              >
                <rect
                  x="8"
                  y="8"
                  width="32"
                  height="32"
                  rx="4"
                  stroke="#71717A"
                  strokeWidth="2"
                />
                <path
                  d="M18 28L24 22L30 28M24 22V34"
                  stroke="#71717A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xs text-gray-500">Image unavailable</p>
            </div>
          </div>
        )}

        {/* Actual image */}
        {!imageError && (
          <img
            src={metadata.image}
            alt={metadata.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-105" : "scale-100"}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Chain badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            border: "1px solid #27272A",
            color: "#FFFFFF",
          }}
        >
          {asset.chain}
        </div>

        {/* Hover overlay */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(10, 10, 10, 0.6)" }}
          >
            <div className="text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="mx-auto"
              >
                <circle cx="24" cy="24" r="20" fill="#CCFF00" />
                <path
                  d="M24 16v16M16 24h16"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-sm font-medium mt-2" style={{ color: "#CCFF00" }}>
                View Full Size
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* NFT Details */}
      <div className="p-3">
        {/* Name and Collection */}
        <div className="mb-2">
          <h3
            className="font-semibold text-sm truncate mb-1"
            style={{ color: "#FFFFFF" }}
            title={metadata.name}
          >
            {metadata.name}
          </h3>
          <p
            className="text-xs truncate"
            style={{ color: "#71717A" }}
            title={metadata.collection}
          >
            {metadata.collection}
          </p>
        </div>

        {/* Floor Price and Marketplace Link */}
        <div className="flex items-center justify-between">
          {/* Floor Price */}
          {floorPrice ? (
            <div className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-70"
              >
                <path
                  d="M6 1L1 6L6 11L11 6L6 1Z"
                  stroke="#CCFF00"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-medium" style={{ color: "#CCFF00" }}>
                {floorPrice}
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Marketplace Link */}
          <button
            onClick={handleMarketplaceClick}
            className="px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{
              background: isHovered ? "#27272A" : "transparent",
              color: "#71717A",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#71717A";
            }}
          >
            View →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Get OpenSea chain slug
 */
function getChainSlug(chainId: number): string {
  const chainSlugs: Record<number, string> = {
    1: "ethereum",
    137: "matic",
    42161: "arbitrum",
    8453: "base",
  };
  return chainSlugs[chainId] || "ethereum";
}
