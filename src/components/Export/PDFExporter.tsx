import React from 'react';
import { Page, Text, View, Document, StyleSheet, Line, Svg, Path, Circle, Rect, G } from '@react-pdf/renderer';
import { Song, Measure, Beat } from '../../types/tab';
import { paginateSong } from '../../utils/pdfLayout';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#fff' },
  header: { marginBottom: 10, borderBottom: 1, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  artist: { fontSize: 14, color: '#666', marginTop: 4 },
  info: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  infoText: { fontSize: 10, color: '#333' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 10, color: '#999' }
});

interface PDFMeasureProps {
  measure: Measure;
  width: number;
  tuningCount: number;
  timeSignature: [number, number];
  x: number;
  y: number;
}

const PDFMeasure: React.FC<PDFMeasureProps> = ({ measure, width, tuningCount, timeSignature, x: absX, y: absY }) => {
  const lineSpacing = 15;
  const staffHeight = (tuningCount - 1) * lineSpacing;
  const topPadding = 20;

  const expectedDuration = timeSignature[0] * (4 / timeSignature[1]);
  const pixelsPerDuration = width / expectedDuration;

  const actualDuration = measure.beats.reduce((sum, beat) => sum + beat.duration, 0);
  const measureSvgWidth = Math.max(width, actualDuration * pixelsPerDuration);

  let currentX = 0;
  const beatPositions = measure.beats.map((beat) => {
    const xPos = currentX;
    const beatWidth = beat.duration * pixelsPerDuration;
    currentX += beatWidth;
    return { x: xPos, width: beatWidth };
  });

  const renderRest = (beat: Beat, centerX: number, color: string) => {
    const duration = beat.duration;
    const yCenter = staffHeight / 2 + topPadding;

    if (duration >= 4) return <Rect x={centerX - 6} y={lineSpacing + topPadding} width={12} height={5} fill={color} />;
    if (duration >= 2) return <Rect x={centerX - 6} y={lineSpacing * 2 - 5 + topPadding} width={12} height={5} fill={color} />;
    if (duration >= 1) return <Path d={`M ${centerX - 3} ${yCenter - 8} L ${centerX + 2} ${yCenter - 2} L ${centerX - 2} ${yCenter + 3} L ${centerX + 2} ${yCenter + 7} L ${centerX} ${yCenter + 10}`} stroke={color} strokeWidth={1} fill="none" />;
    
    return (
      <G>
        <Line x1={centerX + 3} y1={yCenter - 8} x2={centerX - 3} y2={yCenter + 8} stroke={color} strokeWidth={1} />
        <Circle cx={centerX - 3} cy={yCenter - 5} r={2} fill={color} />
        {duration <= 0.25 && <Circle cx={centerX - 5} cy={yCenter} r={2} fill={color} />}
        {duration <= 0.125 && <Circle cx={centerX - 7} cy={yCenter + 5} r={2} fill={color} />}
      </G>
    );
  };

  return (
    <G transform={`translate(${absX}, ${absY})`}>
      {measure.label && (
        <G transform="translate(0, -15)">
           <Rect x={0} y={0} width={measure.label.length * 6 + 10} height={12} fill="#3b82f6" />
           <Text 
             x={5} 
             y={9} 
             style={{ fontSize: 8, color: 'white', fontWeight: 'bold' }}
           >
             {measure.label.toUpperCase()}
           </Text>
        </G>
      )}
      <G>
        {Array.from({ length: tuningCount }).map((_, i) => (
          <Line key={i} x1={0} y1={i * lineSpacing + topPadding} x2={measureSvgWidth} y2={i * lineSpacing + topPadding} stroke="#ccc" strokeWidth={0.5} />
        ))}
        
        <Line x1={0} y1={topPadding} x2={0} y2={staffHeight + topPadding} stroke="black" strokeWidth={1.5} />
        <Line x1={measureSvgWidth} y1={topPadding} x2={measureSvgWidth} y2={staffHeight + topPadding} stroke="black" strokeWidth={1.5} />

        {measure.beats.map((beat, bIdx) => {
          const { x: beatX, width: beatWidth } = beatPositions[bIdx];
          const centerX = beatX + beatWidth / 2;
          const stemY1 = staffHeight + topPadding + 5;
          const stemY2 = stemY1 + 20;

          return (
            <G key={bIdx}>
              {!beat.isRest && beat.notes.map((note) => {
                const stringY = note.string * lineSpacing + topPadding;
                return (
                  <G key={note.string}>
                    <Circle cx={centerX} cy={stringY} r={7} fill="white" />
                    <Text
                      x={centerX}
                      y={stringY + 3.5} 
                      textAnchor="middle"
                      style={{ fontSize: 10, fontWeight: 'bold' }}
                    >
                      {note.fret}
                    </Text>
                    {note.technique && (
                      <G transform={`translate(${centerX}, ${stringY - 10})`}>
                        <Text 
                          style={{ fontSize: 7, color: '#2563eb', textAnchor: 'middle' }}
                        >
                          {note.technique.charAt(0).toUpperCase()}
                        </Text>
                      </G>
                    )}
                  </G>
                );
              })}

              {beat.isRest && renderRest(beat, centerX, "#999")}

              {!beat.isRest && beat.duration <= 2 && (
                <G>
                  <Line x1={centerX} y1={stemY1} x2={centerX} y2={stemY2} stroke="black" strokeWidth={1} />
                  {beat.duration <= 0.5 && <Path d={`M ${centerX} ${stemY2} L ${centerX + 6} ${stemY2 - 4}`} stroke="black" strokeWidth={1} fill="none" />}
                  {beat.duration <= 0.25 && <Path d={`M ${centerX} ${stemY2 - 4} L ${centerX + 6} ${stemY2 - 8}`} stroke="black" strokeWidth={1} fill="none" />}
                  {beat.duration <= 0.125 && <Path d={`M ${centerX} ${stemY2 - 8} L ${centerX + 6} ${stemY2 - 12}`} stroke="black" strokeWidth={1} fill="none" />}
                </G>
              )}
            </G>
          );
        })}
      </G>
    </G>
  );
};

export const TabDocument: React.FC<{ song: Song }> = ({ song }) => {
  const measureWidth = 133;
  const pages = paginateSong(song, 4, 6, measureWidth);

  return (
    <Document>
      {pages.map((page, pIdx) => (
        <Page key={pIdx} size="A4" style={styles.page}>
          {pIdx === 0 && (
            <View style={styles.header}>
              <Text style={styles.title}>{song.title || 'New Bass Line'}</Text>
              <Text style={styles.artist}>{song.artist || 'Unknown Artist'}</Text>
              <View style={styles.info}>
                <View>
                  <Text style={styles.infoText}>Tempo: {song.tempo} BPM</Text>
                  <Text style={styles.infoText}>Time: {song.timeSignature[0]}/{song.timeSignature[1]}</Text>
                </View>
                <View>
                  <Text style={styles.infoText}>Tuning: {song.tuning.join(' ')}</Text>
                </View>
              </View>
            </View>
          )}
          
          <Svg width="535" height={page.height}>
            {page.measures.map((item, idx) => (
              <PDFMeasure 
                key={idx} 
                measure={item.measure} 
                width={measureWidth} 
                tuningCount={song.tuning.length}
                timeSignature={song.timeSignature}
                x={item.x}
                y={item.y}
              />
            ))}
          </Svg>
          
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} />
        </Page>
      ))}
    </Document>
  );
};
