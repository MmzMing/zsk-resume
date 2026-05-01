import React, { useMemo } from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import type { ResumeBlock, ExperienceItem, HeaderField } from '@/types/resume'

const NOTO_SANS_SC = 'https://fonts.gstatic.com/s/notosanssc/v36/k3kSo84MOvI-kF6u9LkwE-7QhA.woff2'
const NOTO_SANS_SC_BOLD = 'https://fonts.gstatic.com/s/notosanssc/v36/k3kSo84MOvI-kF6u9LkwE-7QhA.woff2'

try {
  Font.register({
    family: 'NotoSansSC',
    fonts: [
      { src: NOTO_SANS_SC, fontWeight: 'normal' },
      { src: NOTO_SANS_SC_BOLD, fontWeight: 'bold' },
      { src: NOTO_SANS_SC, fontWeight: 'normal', fontStyle: 'italic' },
      { src: NOTO_SANS_SC_BOLD, fontWeight: 'bold', fontStyle: 'italic' },
    ]
  })
} catch {
  // Font already registered
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansSC',
    fontSize: 11,
    lineHeight: 1.5,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
    color: '#000000',
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  title: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 2,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    borderBottom: '1 solid #000000',
    paddingBottom: 3,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  item: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  itemDate: {
    fontSize: 9,
    color: '#666666',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 9,
    color: '#444444',
  },
  skillTag: {
    padding: '2 8',
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    border: '0.5 solid #cccccc',
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 9,
    color: '#333333',
  },
  photo: {
    width: 60,
    height: 80,
    objectFit: 'cover',
    marginBottom: 12,
    borderRadius: 2,
  },
})

function stripHTML(html: string): string {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

interface ATSResumePDFProps {
  blocks: ResumeBlock[]
  photo: string | null
  pageLayout: {
    fontSize?: number
    lineHeight?: number
    marginTop?: number
    marginBottom?: number
    marginLeft?: number
    marginRight?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
  }
  template: unknown
}

export const ATSResumePDF: React.FC<ATSResumePDFProps> = ({ blocks, photo, pageLayout }) => {
  const dynamicStyles = useMemo(() => StyleSheet.create({
    page: {
      ...styles.page,
      fontSize: pageLayout?.fontSize || 11,
      lineHeight: pageLayout?.lineHeight || 1.5,
      paddingTop: pageLayout?.marginTop || 36,
      paddingBottom: pageLayout?.marginBottom || 36,
      paddingLeft: pageLayout?.marginLeft || 36,
      paddingRight: pageLayout?.marginRight || 36,
    },
  }), [pageLayout])

  const headerBlock = blocks.find(b => b.type === 'header')
  const headerFields = headerBlock?.headerFields || []
  
  const getField = (key: string): string => {
    return headerFields.find((f: HeaderField) => f.key === key)?.value || ''
  }

  const experienceBlock = blocks.find(b => b.type === 'experience')
  const educationBlock = blocks.find(b => b.type === 'education')
  const skillsBlock = blocks.find(b => b.type === 'skills')
  const summaryBlock = blocks.find(b => b.type === 'summary')
  const projectsBlock = blocks.find(b => b.type === 'projects')

  const contactInfo = [getField('email'), getField('phone'), getField('location')]
    .filter(Boolean)
    .join(' | ')

  return (
    <Document
      title={`${getField('name')} - ${getField('title')} Resume`}
      author={getField('name')}
      subject="Resume"
      keywords={skillsBlock?.content?.skills?.join(', ') || ''}
    >
      <Page size="A4" style={dynamicStyles.page}>
        {photo && <Image src={photo} style={styles.photo} />}

        <View style={styles.header}>
          <Text style={styles.name}>{getField('name') || '姓名'}</Text>
          {getField('title') && <Text style={styles.title}>{getField('title')}</Text>}
          {contactInfo && <Text style={styles.contact}>{contactInfo}</Text>}
        </View>

        {summaryBlock?.content?.text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人摘要</Text>
            <Text style={styles.itemDescription}>
              {stripHTML(summaryBlock.content.text as string)}
            </Text>
          </View>
        )}

        {experienceBlock?.content?.items && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>工作经历</Text>
            {(experienceBlock.content.items as ExperienceItem[]).map((item, index) => (
              <View key={item.id || `exp-${index}`} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.company || '公司名称'}</Text>
                  <Text style={styles.itemDate}>
                    {item.startDate || '开始日期'} - {item.endDate || '结束日期'}
                  </Text>
                </View>
                {item.title && <Text style={styles.itemSubtitle}>{item.title}</Text>}
                {item.description && (
                  <Text style={styles.itemDescription}>
                    {stripHTML(item.description)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {educationBlock?.content?.items && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育背景</Text>
            {(educationBlock.content.items as ExperienceItem[]).map((item, index) => (
              <View key={item.id || `edu-${index}`} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.company || '学校名称'}</Text>
                  <Text style={styles.itemDate}>
                    {item.startDate || '开始日期'} - {item.endDate || '结束日期'}
                  </Text>
                </View>
                {item.title && <Text style={styles.itemSubtitle}>{item.title}</Text>}
              </View>
            ))}
          </View>
        )}

        {skillsBlock?.content?.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>专业技能</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {(skillsBlock.content.skills as string[]).map((skill, index) => (
                <View key={`${skill}-${index}`} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {projectsBlock?.content?.items && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>项目经历</Text>
            {(projectsBlock.content.items as ExperienceItem[]).map((item, index) => (
              <View key={item.id || `proj-${index}`} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.company || '项目名称'}</Text>
                  <Text style={styles.itemDate}>
                    {item.startDate || '开始日期'} - {item.endDate || '结束日期'}
                  </Text>
                </View>
                {item.title && <Text style={styles.itemSubtitle}>{item.title}</Text>}
                {item.description && (
                  <Text style={styles.itemDescription}>
                    {stripHTML(item.description)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
