#!/usr/bin/env node

/**
 * Script para gerar ícones PWA básicos
 * Este script cria ícones simples com texto para desenvolvimento
 * Em produção, substitua por ícones profissionais
 */

const fs = require('fs')
const path = require('path')

// Tamanhos de ícones necessários para PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

// Função para criar um SVG simples com texto
function createSVGIcon(size, text = 'SF') {
  const fontSize = Math.floor(size * 0.4)
  const strokeWidth = Math.max(1, Math.floor(size * 0.02))
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" fill="url(#grad)" stroke="#1565C0" stroke-width="${strokeWidth}"/>
  
  <!-- Text -->
  <text x="${size/2}" y="${size/2 + fontSize/3}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="white">
    ${text}
  </text>
</svg>`
}

// Função para converter SVG para PNG usando canvas (simulado)
function createPNGIcon(size) {
  // Para desenvolvimento, vamos criar um arquivo SVG
  // Em produção, você pode usar uma biblioteca como sharp ou canvas
  const svgContent = createSVGIcon(size)
  return svgContent
}

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Gerar ícones
console.log('🎨 Gerando ícones PWA...')

iconSizes.forEach(size => {
  const iconContent = createPNGIcon(size)
  const filename = `icon-${size}x${size}.svg`
  const filepath = path.join(iconsDir, filename)
  
  fs.writeFileSync(filepath, iconContent)
  console.log(`✅ Criado: ${filename}`)
})

// Criar ícones especiais
const specialIcons = [
  { name: 'shortcut-hiperfocos.svg', size: 96, text: '🚀' },
  { name: 'shortcut-estudos.svg', size: 96, text: '📚' },
  { name: 'shortcut-saude.svg', size: 96, text: '💊' },
  { name: 'shortcut-sono.svg', size: 96, text: '😴' }
]

specialIcons.forEach(({ name, size, text }) => {
  const iconContent = createSVGIcon(size, text)
  const filepath = path.join(iconsDir, name)
  
  fs.writeFileSync(filepath, iconContent)
  console.log(`✅ Criado: ${name}`)
})

// Criar README para os ícones
const readmeContent = `# Ícones PWA - StayFocus

Este diretório contém os ícones necessários para o Progressive Web App (PWA) do StayFocus.

## Ícones Principais
${iconSizes.map(size => `- icon-${size}x${size}.svg - Ícone ${size}x${size}px`).join('\n')}

## Ícones de Shortcuts
- shortcut-hiperfocos.svg - Ícone para shortcut de hiperfocos
- shortcut-estudos.svg - Ícone para shortcut de estudos  
- shortcut-saude.svg - Ícone para shortcut de saúde
- shortcut-sono.svg - Ícone para shortcut de sono

## Notas de Desenvolvimento

Estes são ícones temporários gerados automaticamente para desenvolvimento.
Para produção, substitua por ícones profissionais nos formatos PNG.

### Como substituir por ícones profissionais:

1. Crie ícones PNG nos tamanhos necessários
2. Substitua os arquivos SVG por PNG
3. Atualize o manifest.json se necessário
4. Teste em diferentes dispositivos

### Ferramentas recomendadas:
- [PWA Builder](https://www.pwabuilder.com/) - Gerador de ícones PWA
- [Favicon Generator](https://realfavicongenerator.net/) - Gerador completo
- [App Icon Generator](https://appicon.co/) - Gerador de ícones de app

## Requisitos PWA

Para uma PWA completa, você precisa de:
- ✅ Ícones em múltiplos tamanhos
- ✅ Manifest.json configurado
- ✅ Service Worker implementado
- ✅ HTTPS (em produção)
- ✅ Responsivo
`

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent)

console.log('\n🎉 Ícones PWA gerados com sucesso!')
console.log('📁 Localização:', iconsDir)
console.log('\n⚠️  Nota: Estes são ícones temporários para desenvolvimento.')
console.log('   Para produção, substitua por ícones profissionais em PNG.')
