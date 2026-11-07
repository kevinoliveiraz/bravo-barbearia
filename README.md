# BRAVO — Barbearia Contemporânea

Protótipo autoral de portfólio, criado em 6 de novembro de 2026. A BRAVO é uma marca fictícia, sem vínculo com os negócios da pesquisa de leads.

## Usar

Abra `index.html` diretamente ou execute `npm run dev` nesta pasta e acesse o endereço mostrado no terminal. Não há dependências para instalar. Todos os arquivos visuais e fontes estão no projeto.

## Experiência

- Layout editorial responsivo, tipografia expressiva, preto, creme e laranja queimado.
- Abertura com cortinas e letras em sequência em todo carregamento; transição de lâmina na navegação, tipografia sobreposta à fotografia e carimbo em rotação.
- Paralaxe discreta, botões magnéticos, prévia fotográfica dos serviços no hover e cursor contextual da galeria em dispositivos com mouse.
- Comparação ilustrativa de antes e depois, controlável por arraste, toque ou teclado. Imagens alinhadas e otimizadas em WebP.
- Galeria com filtros, ampliação, navegação por setas e suporte a teclado.
- Agendamento demonstrativo em três etapas: serviço e profissional; data e horário; revisão e confirmação.
- Quatro serviços com preço e duração; horários incompatíveis com a duração ficam indisponíveis.
- Menu móvel, perguntas expansíveis, animações de entrada e respeito a movimento reduzido.
- Diálogos nativos com Escape e gerenciamento de foco; nome opcional tratado como texto.

Serviços, valores, equipe e disponibilidade são exemplos. Nenhuma reserva real é criada. O nome opcional fica somente na memória da página e é limpo quando o diálogo fecha. Não há formulário externo, armazenamento de dados pessoais, analytics ou envio de mensagens. Os efeitos respeitam a preferência de movimento reduzido do sistema.

## Arquivos

- `index.html`: estrutura e conteúdo.
- `styles.css`: identidade visual, animações e adaptação às telas.
- `app.js`: interações.
- `effects.css` e `effects.js`: direção de movimento, sobreposições e comparação.
- `motion.css`: hovers com preenchimento, brilho e deslocamento, imagens em cor no hover, transições de galeria e abertura/fechamento dos diálogos.
- `responsive.css`: navegação móvel até 1024 px, áreas de toque maiores, formulários sem zoom automático no iOS, agenda com datas em três colunas no celular e diálogos adaptados à orientação da tela.
- `assets/`: fotografia de capa, fotografias de apoio e fontes locais.
- `preview.mjs`: servidor local sem dependências.

## Imagens e fontes

Referência visual consultada no Pinterest: https://br.pinterest.com/search/pins/?q=web%20sitte%20barbearia&rs=typed. A composição foi desenvolvida especificamente para a BRAVO, sem reutilizar um template dos pins.

Fotografia principal: gerada com a ferramenta integrada ImageGen; arquivo otimizado em `assets/hero.webp`, com original em `source-images/hero.png`. A imagem de antes é uma edição ilustrativa feita com a mesma ferramenta: `assets/before.webp`, com original em `source-images/before.png`.

Prompt final da fotografia principal:

> Use case: photorealistic-natural. Asset type: exclusive hero photograph for a high-end Brazilian contemporary barbershop website, fictional brand BRAVO. Create a cinematic editorial landscape photograph, 1536x1024 composition. A stylish adult Brazilian man in side profile facing left, seated in a worn black leather barber chair, eyes relaxed, with a perfectly detailed short textured crop haircut and crisp low skin fade. A professional barber's natural hands and tattooed forearm hold a chrome trimmer precisely near the temple. Realistic hands, natural anatomy, authentic hair texture and skin pores. Face and haircut are the focus near the right-center, dim warm industrial barbershop background, a subtle vertical strip of window light, deep shadows, analog 35mm film grain, masterful chiaroscuro, bold magazine photography. Mostly black-and-white desaturated tones with faint warm gray, intense yet approachable, no glossy AI look. Leave some dark breathing room on left edge. No text, logos, watermarks, split screen, frames, or graphic elements. One coherent photographic scene.

Fotografias de apoio obtidas no Unsplash, usadas como referências visuais do conceito, não como trabalhos ou integrantes reais da BRAVO:

- `studio.jpg`: https://images.unsplash.com/photo-1503951914875-452162b0f3f1
- `ritual.jpg`: https://images.unsplash.com/photo-1621605815971-fbc98d665033
- `corte.jpg`: https://images.unsplash.com/photo-1599351431202-1e0f0137899a

Fontes: Barlow Condensed e DM Sans, distribuídas pelo Google Fonts e salvas localmente. Famílias sob SIL Open Font License. A fotografia principal foi gerada pelo modo integrado, sem CLI/API de imagem.

Prompt final da edição de antes:

> Use case: precise-object-edit. Edit target: the provided editorial photograph. Create the BEFORE hairstyle version for an interactive before/after comparison, preserving exact pixel alignment and composition as closely as possible. Change ONLY the seated man's scalp hair: make it an overgrown, unstyled version of the same black hair, substantially longer around his temple and above his ears, with no skin fade, untidy natural edges and a slightly bulky unshaped top. Do not change his face, facial identity, expression, beard, skin tone, ear, eyebrows, body, clothing, chair, barber's hands, tattooed forearm, chrome trimmer, background, camera angle, crop, lighting or image size. Keep the same head silhouette position and his eyes at exactly the same location. Hair should clearly read as before a barbershop cut, not a different person. Preserve the same cinematic near monochrome film aesthetic. No text, watermarks, graphic elements or split panels. Produce ONE full photograph with same dimensions as reference. This is a fictional portfolio visual study, not a real customer claim.
