import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const generalQuestions = [
    {
      question: "Qu'est-ce que Passerelle Jeunesse ?",
      answer: "Passerelle Jeunesse est un service professionnel d'accompagnement destiné aux jeunes de 7 à 20 ans. Nous assurons leurs déplacements en toute sécurité, que ce soit pour des trajets locaux (école, activités) ou des voyages longue distance dans toute la France."
    },
    {
      question: "Quelles sont les zones d'intervention ?",
      answer: "Nous intervenons principalement à Metz et Saint-Avold pour les accompagnements locaux. Pour les trajets longue distance, nous accompagnons les jeunes dans toute la France en train ou en bus."
    },
    {
      question: "Quel est l'âge minimum et maximum ?",
      answer: "Notre service s'adresse aux jeunes âgés de 7 à 20 ans. Les modalités d'accompagnement sont adaptées selon l'âge et la maturité de chaque jeune."
    },
    {
      question: "Combien de jeunes pouvez-vous accompagner ?",
      answer: "Pour les 7-10 ans : 1 à 2 jeunes maximum. Pour les 11-14 ans : 2 à 3 jeunes. Pour les 15-20 ans : jusqu'à 5 jeunes selon la complexité du trajet. Des tarifs préférentiels sont appliqués pour les fratries."
    }
  ];

  const bookingQuestions = [
    {
      question: "Comment réserver une prestation ?",
      answer: "Contactez-nous par téléphone, email ou via notre formulaire de contact. Nous établirons ensemble un devis personnalisé selon vos besoins. Une fois validé, nous formalisons la mission par un contrat et une autorisation parentale."
    },
    {
      question: "Quel délai pour réserver ?",
      answer: "Nous recommandons de réserver au moins 7 jours à l'avance pour les trajets longue distance et 48h pour les accompagnements locaux. Selon nos disponibilités, nous pouvons parfois accepter des demandes plus urgentes."
    },
    {
      question: "Puis-je annuler ou modifier une réservation ?",
      answer: "Oui, selon les conditions générales de vente. Une annulation plus de 7 jours avant la prestation permet un remboursement intégral. Entre 7 et 3 jours : remboursement de 50%. Moins de 3 jours : aucun remboursement sauf cas de force majeure."
    },
    {
      question: "Comment se passe le paiement ?",
      answer: "Le paiement s'effectue par virement bancaire, chèque ou espèces. Pour les trajets longue distance, un acompte de 30% est demandé à la réservation, le solde étant dû 48h avant la prestation."
    }
  ];

  const safetyQuestions = [
    {
      question: "Êtes-vous assuré ?",
      answer: "Oui, nous disposons d'une assurance Responsabilité Civile Professionnelle couvrant l'ensemble de nos prestations. Une copie de l'attestation peut être fournie sur demande."
    },
    {
      question: "Quels documents sont obligatoires ?",
      answer: "Trois documents sont indispensables : une autorisation parentale signée, une fiche de renseignements complète (contacts d'urgence, informations médicales, allergies), et une copie de la pièce d'identité du jeune."
    },
    {
      question: "Comment communiquez-vous avec les parents ?",
      answer: "Nous restons en contact permanent : SMS au départ, messages réguliers pendant le trajet, photos de confirmation (avec accord), et appel à l'arrivée. Les parents peuvent nous joindre à tout moment."
    },
    {
      question: "Que se passe-t-il en cas d'imprévu ?",
      answer: "En cas de retard de transport, incident ou changement de programme, nous informons immédiatement les parents. Nous nous adaptons et gérons la situation en priorité pour la sécurité et le bien-être du jeune."
    },
    {
      question: "Les jeunes sont-ils surveillés en permanence ?",
      answer: "Oui, un accompagnateur reste avec le ou les jeunes durant toute la durée de la mission, de la prise en charge à la remise en main propre à l'adulte désigné."
    }
  ];

  const practicalQuestions = [
    {
      question: "Faut-il prévoir les billets de transport ?",
      answer: "Pour les trajets longue distance, vous devez fournir les billets de transport pour le(s) jeune(s). Le billet de l'accompagnateur est inclus dans le tarif de la prestation."
    },
    {
      question: "Que dois-je préparer pour mon enfant ?",
      answer: "Un sac avec repas/collations, une bouteille d'eau, des distractions (livre, tablette), les médicaments éventuels, et ses documents d'identité. Nous vous fournirons une checklist complète lors de la réservation."
    },
    {
      question: "Acceptez-vous les trajets avec correspondances ?",
      answer: "Oui, nous gérons les correspondances multiples. C'est justement notre valeur ajoutée : coordonner les changements, éviter les erreurs et rassurer les jeunes dans les gares ou stations."
    },
    {
      question: "Accompagnez-vous aussi pour des rendez-vous médicaux ?",
      answer: "Oui, nous accompagnons les jeunes à leurs rendez-vous médicaux ou administratifs. Attention : nous assurons uniquement l'accompagnement, pas la présence pendant la consultation (sauf demande spécifique du professionnel de santé)."
    },
    {
      question: "Proposez-vous des accompagnements réguliers ?",
      answer: "Oui, nous proposons des forfaits pour des accompagnements hebdomadaires (école, activités sportives, internat). Contactez-nous pour établir un planning et une tarification adaptée."
    }
  ];

  const trustQuestions = [
    {
      question: "Qui sont les accompagnateurs ?",
      answer: "Actuellement, le service est assuré par Nathan Imogo, auto-entrepreneur expérimenté dans l'accompagnement de jeunes. À terme, une équipe de professionnels formés et vérifiés pourra être intégrée."
    },
    {
      question: "Avez-vous un casier judiciaire vierge ?",
      answer: "Oui, un extrait de casier judiciaire (bulletin n°3) vierge peut être fourni sur demande, conformément aux exigences légales pour travailler avec des mineurs."
    },
    {
      question: "Avez-vous une formation spécifique ?",
      answer: "Nous avons une expérience pratique dans l'accompagnement de jeunes et la gestion de situations d'urgence (premiers secours, communication de crise). Nous nous formons en continu sur les bonnes pratiques."
    },
    {
      question: "Puis-je vous rencontrer avant la première mission ?",
      answer: "Absolument ! Nous encourageons même un premier rendez-vous sans engagement pour faire connaissance, rassurer les parents et créer un lien de confiance avec le jeune."
    }
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
              Retrouvez les réponses aux questions les plus courantes sur nos services d'accompagnement
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          {/* Questions générales */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Questions générales</h2>
            <Accordion type="single" collapsible className="w-full">
              {generalQuestions.map((item, index) => (
                <AccordionItem key={`general-${index}`} value={`general-${index}`}>
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

          {/* Réservation et tarifs */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Réservation et tarifs</h2>
            <Accordion type="single" collapsible className="w-full">
              {bookingQuestions.map((item, index) => (
                <AccordionItem key={`booking-${index}`} value={`booking-${index}`}>
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

          {/* Sécurité */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Sécurité et confiance</h2>
            <Accordion type="single" collapsible className="w-full">
              {safetyQuestions.map((item, index) => (
                <AccordionItem key={`safety-${index}`} value={`safety-${index}`}>
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

          {/* Questions pratiques */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Questions pratiques</h2>
            <Accordion type="single" collapsible className="w-full">
              {practicalQuestions.map((item, index) => (
                <AccordionItem key={`practical-${index}`} value={`practical-${index}`}>
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

          {/* Confiance */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Faire confiance</h2>
            <Accordion type="single" collapsible className="w-full">
              {trustQuestions.map((item, index) => (
                <AccordionItem key={`trust-${index}`} value={`trust-${index}`}>
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

          {/* Contact */}
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
