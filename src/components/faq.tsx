import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqSections = [
    {
      title: "Accompagnement et mobilité",
      questions: [
        {
          question: "Quels types de trajets accompagnez-vous ?",
          answer:
            "Nous accompagnons les jeunes pour leurs trajets scolaires, leurs activités, leurs rendez-vous médicaux ou administratifs, ainsi que pour les voyages longue distance dans toute la France.",
        },
        {
          question: "Quelles sont les zones d'intervention ?",
          answer:
            "Nous intervenons principalement autour de Metz et de Saint-Avold pour les accompagnements locaux. Pour les trajets longue distance, nous pouvons intervenir dans toute la France.",
        },
        {
          question: "Acceptez-vous les trajets avec correspondances ?",
          answer:
            "Oui. Nous gérons les correspondances et les changements de train ou de bus afin d'apporter un accompagnement rassurant et fluide jusqu'à destination.",
        },
        {
          question: "Faut-il prévoir les billets de transport ?",
          answer:
            "Pour les trajets longue distance, les billets du jeune et de l'accompagnant sont généralement à prévoir selon le mode de transport retenu. Nous vous conseillons les modalités au moment de la réservation.",
        },
        {
          question: "Proposez-vous des accompagnements réguliers ?",
          answer:
            "Oui. Nous pouvons mettre en place des accompagnements récurrents pour l'école, les activités sportives, les internats ou les rendez-vous réguliers, avec un cadre stable et rassurant.",
        },
      ],
    },
    {
      title: "Baby-Sitting",
      questions: [
        {
          question: "À partir de quel âge gardez-vous les enfants ?",
          answer:
            "Nous proposons la garde d'enfants de 4 à 16 ans. Pour les enfants de moins de 4 ans, nous vous invitons à nous contacter directement, car une évaluation spécifique est nécessaire selon le profil de l'intervenant disponible.",
        },
        {
          question: "Que se passe-t-il en cas d'urgence pendant une garde ?",
          answer:
            "L'intervenant contacte immédiatement les secours si nécessaire, puis les parents. Une procédure d'urgence claire vous est communiquée avant la première garde, avec vos contacts prioritaires.",
        },
        {
          question: "Puis-je demander une garde récurrente chaque semaine ?",
          answer:
            "Oui. Après une première garde d'essai, nous pouvons mettre en place un planning hebdomadaire régulier avec le même intervenant, si cela correspond à vos besoins.",
        },
        {
          question: "L'intervenant peut-il administrer un médicament à mon enfant ?",
          answer:
            "Uniquement sur consigne écrite préalable des parents. Sans cette consigne, aucun médicament n'est administré.",
        },
      ],
    },
    {
      title: "Soutien Scolaire",
      questions: [
        {
          question: "Quelles matières couvrez-vous ?",
          answer:
            "Cela dépend des intervenants disponibles et du niveau scolaire de votre enfant. Nous vous proposons un accompagnement adapté selon les matières concernées et les besoins observés.",
        },
        {
          question: "Garantissez-vous une amélioration des notes ?",
          answer:
            "Non. Nous ne garantissons pas de résultat scolaire. Notre accompagnement vise à aider l'enfant à reprendre confiance, à s'organiser et à progresser à son rythme.",
        },
        {
          question: "Vos intervenants sont-ils enseignants ?",
          answer:
            "Nos intervenants ne sont pas des enseignants certifiés de l'Éducation nationale. Il s'agit d'un accompagnement à l'autonomie et aux devoirs, pas d'un cours particulier disciplinaire académique.",
        },
        {
          question: "Mon enfant a des besoins spécifiques : pouvez-vous l'accompagner ?",
          answer:
            "Nous ne sommes pas une structure spécialisée dans ce type d'accompagnement. Nous pouvons toutefois échanger avec vous pour évaluer si notre service est adapté et vous orienter vers des structures compétentes si nécessaire.",
        },
      ],
    },
    {
      title: "Général et confiance",
      questions: [
        {
          question: "Vos services ouvrent-ils droit à un crédit d'impôt ?",
          answer:
            "Cela dépend de votre situation personnelle et de votre éligibilité aux services à la personne. Si vous souhaitez en savoir plus, nous vous conseillons de vérifier votre situation avec votre conseiller fiscal ou votre déclaration de revenus.",
        },
        {
          question: "Le même intervenant s'occupe-t-il du transport, de la garde et du soutien scolaire ?",
          answer:
            "Selon les disponibilités, nous privilégions un intervenant unique par famille pour assurer une continuité de confiance. Cela dépend toutefois du planning et de la nature des missions demandées.",
        },
        {
          question: "Êtes-vous assuré ?",
          answer:
            "Oui. Nous disposons d'une assurance responsabilité civile professionnelle couvrant l'ensemble de nos prestations. Une copie de l'attestation peut être fournie sur demande.",
        },
        {
          question: "Quels documents sont obligatoires ?",
          answer:
            "Nous demandons généralement une autorisation parentale signée, des coordonnées d'urgence complètes ainsi que toute information utile concernant l'enfant et son cadre de vie.",
        },
      ],
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Questions Fréquentes
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Retrouvez les réponses aux questions les plus courantes sur nos services de mobilité, de baby-sitting et de soutien scolaire.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          {faqSections.map((section, sectionIndex) => (
            <div key={`section-${sectionIndex}`}>
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((item, index) => (
                  <AccordionItem key={`${section.title}-${index}`} value={`${section.title}-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="mt-12 p-6 bg-muted rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-muted-foreground mb-4">
              N'hésitez pas à nous contacter directement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contact@passerellejeunesse.fr" className="text-primary hover:underline">
                contact@passerellejeunesse.fr
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a href="tel:+33619226294" className="text-primary hover:underline">
                06 19 22 62 94
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
