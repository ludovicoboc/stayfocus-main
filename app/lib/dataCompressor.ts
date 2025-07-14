/**
 * Sistema de Compressão de Dados para Sincronização
 * Usa pako para compressão gzip dos dados JSON
 */

import pako from 'pako';

export interface CompressionResult {
  compressed: Uint8Array;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: 'gzip' | 'none';
}

export interface DecompressionResult {
  decompressed: string;
  originalSize: number;
  success: boolean;
  error?: string;
}

export class DataCompressor {
  private readonly COMPRESSION_THRESHOLD = 1024; // 1KB - não comprimir dados menores
  private readonly COMPRESSION_LEVEL = 6; // Nível de compressão (1-9)

  /**
   * Comprime dados JSON usando gzip
   */
  compress(data: any): CompressionResult {
    try {
      const jsonString = JSON.stringify(data);
      const originalSize = new TextEncoder().encode(jsonString).length;

      // Não comprimir se os dados são muito pequenos
      if (originalSize < this.COMPRESSION_THRESHOLD) {
        return {
          compressed: new TextEncoder().encode(jsonString),
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1,
          format: 'none'
        };
      }

      // Comprimir usando gzip
      const compressed = pako.gzip(jsonString, { level: this.COMPRESSION_LEVEL });
      const compressedSize = compressed.length;
      const compressionRatio = originalSize / compressedSize;

      console.log(`📦 Compressão: ${originalSize} → ${compressedSize} bytes (${compressionRatio.toFixed(2)}x)`);

      return {
        compressed,
        originalSize,
        compressedSize,
        compressionRatio,
        format: 'gzip'
      };
    } catch (error) {
      console.error('Erro na compressão:', error);
      
      // Fallback para dados não comprimidos
      const jsonString = JSON.stringify(data);
      const originalSize = new TextEncoder().encode(jsonString).length;
      
      return {
        compressed: new TextEncoder().encode(jsonString),
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        format: 'none'
      };
    }
  }

  /**
   * Descomprime dados gzip
   */
  decompress(compressed: Uint8Array, format: 'gzip' | 'none'): DecompressionResult {
    try {
      let decompressed: string;
      
      if (format === 'none') {
        decompressed = new TextDecoder().decode(compressed);
      } else if (format === 'gzip') {
        const decompressedBytes = pako.ungzip(compressed);
        decompressed = new TextDecoder().decode(decompressedBytes);
      } else {
        throw new Error(`Formato de compressão não suportado: ${format}`);
      }

      const originalSize = new TextEncoder().encode(decompressed).length;
      
      console.log(`📦 Descompressão: ${compressed.length} → ${originalSize} bytes`);

      return {
        decompressed,
        originalSize,
        success: true
      };
    } catch (error: any) {
      console.error('Erro na descompressão:', error);
      
      return {
        decompressed: '',
        originalSize: 0,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Comprime dados para envio via API
   */
  compressForUpload(data: any): {
    payload: string;
    metadata: {
      compressed: boolean;
      format: 'gzip' | 'none';
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    };
  } {
    const result = this.compress(data);
    
    // Converter para base64 para envio via JSON
    const payload = Buffer.from(result.compressed).toString('base64');
    
    return {
      payload,
      metadata: {
        compressed: result.format !== 'none',
        format: result.format,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio
      }
    };
  }

  /**
   * Descomprime dados recebidos via API
   */
  decompressFromUpload(payload: string, metadata: {
    compressed: boolean;
    format: 'gzip' | 'none';
  }): { data: any; success: boolean; error?: string } {
    try {
      // Decodificar base64
      const compressed = new Uint8Array(Buffer.from(payload, 'base64'));
      
      // Descomprimir
      const result = this.decompress(compressed, metadata.format);
      
      if (!result.success) {
        throw new Error(result.error || 'Falha na descompressão');
      }
      
      // Parsear JSON
      const data = JSON.parse(result.decompressed);
      
      return { data, success: true };
    } catch (error: any) {
      console.error('Erro ao descomprimir dados da API:', error);
      
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calcula estatísticas de compressão
   */
  getCompressionStats(data: any): {
    originalSize: number;
    estimatedCompressedSize: number;
    estimatedRatio: number;
    shouldCompress: boolean;
  } {
    const jsonString = JSON.stringify(data);
    const originalSize = new TextEncoder().encode(jsonString).length;
    
    // Estimativa baseada em compressão típica de JSON (60-80%)
    const estimatedRatio = 0.3; // 70% de redução estimada
    const estimatedCompressedSize = Math.round(originalSize * estimatedRatio);
    
    return {
      originalSize,
      estimatedCompressedSize,
      estimatedRatio: 1 / estimatedRatio,
      shouldCompress: originalSize > this.COMPRESSION_THRESHOLD
    };
  }
}

// Instância singleton
export const dataCompressor = new DataCompressor(); 