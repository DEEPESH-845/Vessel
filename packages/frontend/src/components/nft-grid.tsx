/**
 * NFTGrid Component
 * Displays NFT holdings in a responsive grid layout
 * Requirements: FR-11.5
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UnifiedAsset, NFTMetadata } from "@/types/multi-chain.types";
import NFTCard from "./nft-card";
import { useState } from "react";

interface NFTGridProps {
  nfts: UnifiedAsset[];
}

export default function NFTGrid({ nfts }: NFTGridProps) {
  const [selectedNFT, setSelectedNFT] = useState<UnifiedAsset | null>(null);

  // Handle image zoom
  const handleImageClick = (asset: UnifiedAsset) => {
    setSelectedNFT(asset);
  };

  // Close zoom modal
  const handleCloseZoom = () => {
    setSelectedNFT(null);
  };

  // Empty state
  if (nfts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-12 rounded-2xl text-center"
        style={{ background: "#18181B", border: "1px solid #27272A" }}
      >
        <div className="mb-4">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="mx-auto opacity-50"
          >
            <rect
              x="12"
              y="12"
              width="40"
              height="40"
              rx="4"
              stroke="#27272A"
              strokeWidth="2"
            />
            <path
              d="M22 42L32 32L42 42M32 32V52"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
          No NFTs Found
        </h3>
        <p className="text-sm" style={{ color: "#71717A" }}>
          You don't have any NFTs in your wallet yet.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* NFT Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {nfts.map((nft, index) => {
          const nftMetadata = nft.metadata as NFTMetadata;
          return (
            <motion.div
              key={`${nftMetadata.contractAddress}-${nftMetadata.tokenId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <NFTCard asset={nft} onImageClick={handleImageClick} />
            </motion.div>
          );
        })}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <NFTZoomModal nft={selectedNFT} onClose={handleCloseZoom} />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * NFTZoomModal Component
 * Full-screen modal for viewing NFT image
 */
interface NFTZoomModalProps {
  nft: UnifiedAsset;
  onClose: () => void;
}

function NFTZoomModal({ nft, onClose }: NFTZoomModalProps) {
  const metadata = nft.metadata as NFTMetadata;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 10, 10, 0.95)" }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
        style={{
          background: "#18181B",
          border: "1px solid #27272A",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#27272A";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#18181B";
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl w-full max-h-[90vh] overflow-auto rounded-2xl"
        style={{ background: "#18181B", border: "1px solid #27272A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
          <img
            src={metadata.image}
            alt={metadata.name}
            className="w-full h-full object-contain"
            style={{ background: "#0A0A0A" }}
          />
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "#FFFFFF" }}
              >
                {metadata.name}
              </h2>
              <p className="text-sm mb-1" style={{ color: "#71717A" }}>
                {metadata.collection}
              </p>
              <p className="text-xs" style={{ color: "#52525B" }}>
                {nft.chain} • Token ID: {metadata.tokenId}
              </p>
            </div>

            {/* Floor Price */}
            {metadata.floorPrice && (
              <div
                className="px-4 py-2 rounded-lg"
                style={{ background: "#27272A" }}
              >
                <p className="text-xs mb-1" style={{ color: "#71717A" }}>
                  Floor Price
                </p>
                <p className="text-lg font-bold" style={{ color: "#CCFF00" }}>
                  {metadata.floorPrice < 0.01
                    ? "< 0.01"
                    : metadata.floorPrice.toFixed(2)}{" "}
                  ETH
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {metadata.description && (
            <div className="mb-4">
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#FFFFFF" }}
              >
                Description
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#A1A1AA" }}>
                {metadata.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`https://opensea.io/assets/${getChainSlug(nft.chainId)}/${
                metadata.contractAddress
              }/${metadata.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 rounded-lg text-center font-medium transition-colors"
              style={{
                background: "#CCFF00",
                color: "#0A0A0A",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#B8E600";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#CCFF00";
              }}
            >
              View on OpenSea
            </a>
            <a
              href={`https://etherscan.io/nft/${metadata.contractAddress}/${metadata.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-3 rounded-lg text-center font-medium transition-colors"
              style={{
                background: "#27272A",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3F3F46";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#27272A";
              }}
            >
              View on Explorer
            </a>
          </div>
        </div>
      </motion.div>
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
