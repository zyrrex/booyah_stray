// Parser de los ejercicios (Markdown con directivas) escritos en content-private/exercises/*.md
//
// Formato:
//   ### @ex s2-a1 | A1 | Titulo | code | 2 | 30 | tag1,tag2        (id | num | titulo | kind | nivel | xp | tags)
//   #### @enunciado      markdown del enunciado
//   #### @datos          bloque ```js con los datos (code) o las variables de contexto (predict)
//   #### @starter        bloque ```js con el esqueleto inicial del editor
//   #### @solucion       bloque ```js con la solucion de referencia (PRIVADA)
//   #### @tests          bloque ```json con una lista de variantes de datos
//   #### @check          bloque con la salida esperada del caso principal (se verifica contra la solucion)
//   #### @mostrar        (bandera) muestra al alumno la salida esperada de todos los casos
//   #### @pistas         lista "- pista"
//   #### @explicacion    markdown PRIVADO (solo admin)
//   #### @codigo         predict: codigo para predecir / ejecutar
//   #### @runafter       predict: solo se puede ejecutar el codigo tras comprobar
//   #### @preguntas      predict: lista de preguntas (ver README del contenido)

export interface RawExercise {
  id: string
  clase: number
  num: string
  title: string
  kind: 'code' | 'predict'
  level: 1 | 2 | 3
  xp: number
  tags: string[]
  sections: Record<string, string>
  file: string
}

export function parseExercises(text: string, file: string): RawExercise[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const out: RawExercise[] = []
  let cur: RawExercise | null = null
  let section = ''
  let buf: string[] = []
  const flush = () => {
    if (cur && section) cur.sections[section] = buf.join('\n').trim()
    buf = []
  }
  for (const line of lines) {
    const head = line.match(/^###\s+@ex\s+(.+)$/)
    if (head) {
      flush()
      const [id, num, title, kind, level, xp, tags] = head[1].split('|').map((s) => s.trim())
      const clase = Number(id.match(/^s(\d+)-/)?.[1])
      if (!clase || !['code', 'predict'].includes(kind)) throw new Error(`${file}: cabecera invalida: ${line}`)
      cur = {
        id,
        clase,
        num,
        title,
        kind: kind as 'code' | 'predict',
        level: Math.min(3, Math.max(1, Number(level) || 1)) as 1 | 2 | 3,
        xp: Number(xp) || 25,
        tags: (tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
        sections: {},
        file,
      }
      out.push(cur)
      section = ''
      continue
    }
    const sec = line.match(/^####\s+@(\w+)\s*$/)
    if (sec && cur) {
      flush()
      section = sec[1]
      cur.sections[section] = ''
      continue
    }
    if (cur && section) buf.push(line)
  }
  flush()
  return out
}

/** Extrae el contenido del primer bloque ``` de un texto (o el texto completo si no hay). */
export function fence(s: string | undefined): string | undefined {
  if (s === undefined) return undefined
  const m = s.match(/```[\w-]*\n([\s\S]*?)\n```/)
  return (m ? m[1] : s).replace(/\s+$/, '')
}

export function bullets(s: string | undefined): string[] {
  if (!s) return []
  const items: string[] = []
  for (const line of s.split('\n')) {
    if (/^\s*[-*]\s+/.test(line)) items.push(line.replace(/^\s*[-*]\s+/, '').trim())
    else if (items.length && line.trim()) items[items.length - 1] += ' ' + line.trim()
  }
  return items
}
