import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/lib/templates'

export function ResumePDFDocument() {
  const photo = useResumeStore((s) => s.photo)
  const templateId = useResumeStore((s) => s.template.id)
  const pageLayout = useResumeStore((s) => s.pageLayout)

  const template = getTemplate(templateId)

  const styles = StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: pageLayout.fontSize,
      lineHeight: pageLayout.lineHeight,
      paddingTop: pageLayout.marginTop,
      paddingBottom: pageLayout.marginBottom,
      paddingLeft: pageLayout.marginLeft,
      paddingRight: pageLayout.marginRight,
      color: template.colors.text,
    },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {photo && (
          <Image src={photo} style={{ width: 90, height: 120, objectFit: 'cover', marginBottom: 16, borderRadius: 4 }} />
        )}

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>张三</Text>
          <Text style={{ fontSize: 13, color: template.colors.secondary, marginBottom: 6 }}>
            高级前端工程师
          </Text>
          <Text style={{ fontSize: 10, color: template.colors.muted }}>
            zhangsan@example.com | 138-0000-0000 | 北京市
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{
            fontSize: 14, fontWeight: 'bold', color: template.colors.primary,
            borderBottom: `1 solid ${template.colors.border}`, paddingBottom: 4, marginBottom: 8,
          }}>工作经历</Text>

          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>ABC 科技有限公司</Text>
              <Text style={{ fontSize: 10, color: '#888' }}>2020/03 - 至今</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>高级前端工程师</Text>
            <Text style={{ fontSize: 10, color: '#555' }}>负责公司核心产品前端架构设计与开发</Text>
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{
            fontSize: 14, fontWeight: 'bold', color: template.colors.primary,
            borderBottom: `1 solid ${template.colors.border}`, paddingBottom: 4, marginBottom: 8,
          }}>教育背景</Text>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>北京大学</Text>
              <Text style={{ fontSize: 10, color: '#888' }}>2013/09 - 2017/06</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#555' }}>计算机科学 · 本科</Text>
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{
            fontSize: 14, fontWeight: 'bold', color: template.colors.primary,
            borderBottom: `1 solid ${template.colors.border}`, paddingBottom: 4, marginBottom: 8,
          }}>专业技能</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {['React', 'TypeScript', 'Node.js', 'Vue.js', 'Tailwind CSS', 'GraphQL'].map((skill) => (
              <View key={skill} style={{
                padding: '3 10', backgroundColor: `${template.colors.primary}15`,
                borderRadius: 4, border: `1 solid ${template.colors.border}`,
              }}>
                <Text style={{ fontSize: 10, color: template.colors.primary }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
