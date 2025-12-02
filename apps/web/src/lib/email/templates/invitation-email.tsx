import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InvitationEmailProps {
  inviteUrl: string;
  clubName: string;
  roleName: string;
  invitedByName: string;
  expiresInDays: number;
}

export function InvitationEmail({
  inviteUrl,
  clubName,
  roleName,
  invitedByName,
  expiresInDays,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sie wurden zu {clubName} auf Lions Hub eingeladen</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Lions Hub</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Sie wurden eingeladen!</Heading>

            <Text style={text}>
              <strong>{invitedByName}</strong> hat Sie eingeladen, dem Lions Club
              <strong> {clubName}</strong> auf Lions Hub beizutreten.
            </Text>

            <Text style={text}>
              Ihre Rolle: <strong>{roleName}</strong>
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteUrl}>
                Einladung annehmen
              </Button>
            </Section>

            <Text style={textSmall}>Oder kopieren Sie diesen Link in Ihren Browser:</Text>
            <Text style={linkText}>
              <Link href={inviteUrl} style={link}>
                {inviteUrl}
              </Link>
            </Text>

            <Hr style={hr} />

            <Text style={textSmall}>
              Diese Einladung ist <strong>{expiresInDays} Tage</strong> gültig. Nach Ablauf muss eine
              neue Einladung angefordert werden.
            </Text>

            <Text style={textSmall}>
              Falls Sie diese Einladung nicht erwartet haben, können Sie diese Email ignorieren.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Lions Hub - Das Portal für Lions Clubs</Text>
            <Text style={footerText}>
              Diese Email wurde automatisch versendet. Bitte antworten Sie nicht auf diese Email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
};

const header = {
  backgroundColor: '#00338D',
  padding: '30px 40px',
  borderRadius: '8px 8px 0 0',
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '0 0 8px 8px',
};

const h1 = {
  color: '#00338D',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const textSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#00338D',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
  display: 'inline-block' as const,
};

const linkText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#00338D',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  padding: '20px 40px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};
