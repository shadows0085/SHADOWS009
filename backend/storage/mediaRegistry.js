const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vault = require('./vault');

// Registry mapping protected public asset IDs to their encrypted vault representation
const ASSET_REGISTRY = {
  'asset-hero-showreel': {
    id: 'asset-hero-showreel',
    title: 'Showreel 2025 (4K Cinematic)',
    category: 'Showreel',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-1.mp4',
    vaultFile: 'hero_showreel_master',
    isEncrypted: false,
    resolution: '4K DCI HDR',
    bitrate: 'High (Secure Stream)',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-urban-mirage': {
    id: 'asset-urban-mirage',
    title: 'Urban Mirage — Real Estate Campaign',
    category: 'Commercial',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-1.mp4',
    vaultFile: 'urban_mirage_master',
    isEncrypted: false,
    resolution: '4K Ultra HD',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-sun-onlight': {
    id: 'asset-sun-onlight',
    title: 'SUN ONLIGHT — Commercial Showcase',
    category: 'Commercial',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-2.mp4',
    vaultFile: 'sun_onlight_master',
    isEncrypted: false,
    resolution: '4K Ultra HD',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-amber-hours': {
    id: 'asset-amber-hours',
    title: 'Amber Hours — Cinematic Motion',
    category: 'Motion',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-2.mp4',
    vaultFile: 'amber_hours_master',
    isEncrypted: false,
    resolution: '4K Ultra HD',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-silent-waters': {
    id: 'asset-silent-waters',
    title: 'Silent Waters — Narrative Film',
    category: 'Film',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-1.mp4',
    vaultFile: 'silent_waters_master',
    isEncrypted: false,
    resolution: '4K DCI HDR',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-velocity': {
    id: 'asset-velocity',
    title: 'Velocity — High-Speed VFX',
    category: 'VFX',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-2.mp4',
    vaultFile: 'velocity_master',
    isEncrypted: false,
    resolution: '4K Ultra HD',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  },
  'asset-neon-reverie': {
    id: 'asset-neon-reverie',
    title: 'Neon Reverie — Visual Symphony',
    category: 'Motion',
    mimeType: 'video/mp4',
    sourceFile: 'uploaded-video/no-1.mp4',
    vaultFile: 'neon_reverie_master',
    isEncrypted: false,
    resolution: '4K Ultra HD',
    bitrate: 'Master Grade',
    watermarkTier: 'none',
    previewOnly: false
  }
};

/**
 * Encrypt all registered source files into the private vault on startup if not already encrypted
 */
function initializeVaultAssets() {
  const rootDir = path.resolve(__dirname, '../../');
  console.log('[Security Vault] Initializing encrypted private asset storage...');

  for (const [key, asset] of Object.entries(ASSET_REGISTRY)) {
    const fullSourcePath = path.join(rootDir, asset.sourceFile);
    const encFile = path.join(vault.VAULT_DIR, asset.vaultFile + '.enc');

    if (!fs.existsSync(encFile) && fs.existsSync(fullSourcePath)) {
      try {
        console.log(`[Security Vault] Encrypting asset "${asset.title}" (AES-256-GCM)...`);
        const result = vault.encryptFileToVault(fullSourcePath, asset.vaultFile);
        asset.isEncrypted = true;
        asset.checksum = result.checksum;
        asset.size = result.originalSize;
        console.log(`[Security Vault] ✓ Successfully vaulted: ${asset.vaultFile}.enc (${result.originalSize} bytes)`);
      } catch (err) {
        console.error(`[Security Vault] ✗ Failed to encrypt ${asset.vaultFile}:`, err.message);
      }
    } else if (fs.existsSync(encFile)) {
      asset.isEncrypted = true;
    }
  }
}

function getAssetById(assetId) {
  const rootDir = path.resolve(__dirname, '../../');
  const videosJsonPath = path.join(rootDir, 'data', 'videos.json');

  // 1. Dynamic lookup against data/videos.json (ensures replaced video files are immediately used)
  if (fs.existsSync(videosJsonPath)) {
    try {
      const videosData = JSON.parse(fs.readFileSync(videosJsonPath, 'utf8'));

      // Check hero asset
      if (
        assetId === 'asset-hero-showreel' ||
        assetId === videosData.hero?.assetId ||
        assetId === videosData.hero?.src
      ) {
        const heroSrc = videosData.hero.src || 'uploaded-video/no-1.mp4';
        const heroHash = crypto.createHash('md5').update(heroSrc).digest('hex').slice(0, 8);
        return {
          id: 'asset-hero-showreel',
          title: videosData.hero.label || 'Showreel 2025',
          category: 'Showreel',
          mimeType: 'video/mp4',
          sourceFile: heroSrc,
          vaultFile: `hero_${heroHash}`,
          resolution: videosData.hero.badge || '4K DCI HDR',
          watermarkTier: 'none'
        };
      }

      // Check showcase asset
      if (
        videosData.showcase &&
        (assetId === 'asset-showcase' ||
         assetId === videosData.showcase.assetId ||
         assetId === videosData.showcase.file)
      ) {
        const scSrc = videosData.showcase.file || 'uploaded-video/no-1.mp4';
        const scHash = crypto.createHash('md5').update(scSrc).digest('hex').slice(0, 8);
        return {
          id: videosData.showcase.assetId || 'asset-showcase',
          title: videosData.showcase.plainTitle || 'Urban Mirage',
          category: videosData.showcase.category || 'Commercial',
          mimeType: 'video/mp4',
          sourceFile: scSrc,
          vaultFile: `showcase_${scHash}`,
          resolution: videosData.showcase.resolution || '4K HDR',
          watermarkTier: 'none'
        };
      }

      // Check portfolio projects
      if (Array.isArray(videosData.portfolio)) {
        const match = videosData.portfolio.find(
          p => p.id === assetId || p.assetId === assetId || p.file === assetId
        );

        if (match) {
          const matchSrc = match.file || 'uploaded-video/no-1.mp4';
          const matchHash = crypto.createHash('md5').update(matchSrc).digest('hex').slice(0, 8);
          const safeId = (match.id || 'project').replace(/[^a-zA-Z0-9_-]/g, '_');
          return {
            id: match.assetId || match.id,
            title: match.title,
            category: match.category || 'Commercial',
            mimeType: 'video/mp4',
            sourceFile: matchSrc,
            vaultFile: `project_${safeId}_${matchHash}`,
            resolution: match.cat_label || '4K Ultra HD',
            watermarkTier: 'none'
          };
        }
      }

      // Fallback: If assetId is 'asset-urban-mirage' and not matched in portfolio above
      if (assetId === 'asset-urban-mirage') {
        const pMatch = Array.isArray(videosData.portfolio) && videosData.portfolio.find(p => p.id === 'project-urban-mirage');
        const mirageSrc = (pMatch && pMatch.file) || (videosData.showcase && videosData.showcase.file) || 'uploaded-video/no-1.mp4';
        const mirageHash = crypto.createHash('md5').update(mirageSrc).digest('hex').slice(0, 8);
        return {
          id: 'asset-urban-mirage',
          title: (pMatch && pMatch.title) || 'Urban Mirage',
          category: (pMatch && pMatch.category) || 'Commercial',
          mimeType: 'video/mp4',
          sourceFile: mirageSrc,
          vaultFile: `urban_mirage_${mirageHash}`,
          resolution: '4K Ultra HD',
          watermarkTier: 'none'
        };
      }
    } catch (e) {
      console.warn('[mediaRegistry] Failed to read videos.json dynamically:', e.message);
    }
  }

  // 2. Direct file lookup for custom uploaded videos or direct file paths
  if (typeof assetId === 'string') {
    const cleanId = assetId.replace(/^\/+/, '').trim();
    const candidateRel = cleanId.startsWith('uploaded-video/') ? cleanId : `uploaded-video/${cleanId}`;
    const directPath = path.join(rootDir, candidateRel);
    if (fs.existsSync(directPath)) {
      const filename = path.basename(candidateRel);
      const safeVaultKey = 'upload_' + filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      return {
        id: candidateRel,
        title: filename,
        category: 'Uploaded Video',
        mimeType: 'video/mp4',
        sourceFile: candidateRel,
        vaultFile: safeVaultKey,
        resolution: 'Uploaded Video 4K',
        watermarkTier: 'none'
      };
    }
  }

  // 3. Lookup in static ASSET_REGISTRY
  if (ASSET_REGISTRY[assetId]) return ASSET_REGISTRY[assetId];

  // 4. Fallback lookups
  if (typeof assetId === 'string') {
    if (assetId.includes('no-2')) return ASSET_REGISTRY['asset-sun-onlight'];
    if (assetId.includes('no-1')) return ASSET_REGISTRY['asset-urban-mirage'];
  }
  return ASSET_REGISTRY['asset-urban-mirage'];
}

function listPublicMetadata() {
  return Object.values(ASSET_REGISTRY).map(a => ({
    id: a.id,
    title: a.title,
    category: a.category,
    mimeType: a.mimeType,
    resolution: a.resolution,
    watermarkTier: a.watermarkTier
  }));
}

module.exports = {
  ASSET_REGISTRY,
  initializeVaultAssets,
  getAssetById,
  listPublicMetadata
};
