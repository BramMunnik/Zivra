# Zivra – Revalidatie Dashboard voor CVA-Herstel

**Van ruwe sensordata naar direct klinisch inzicht.** ### 📘 Over het project
Dit project is uitgevoerd als onderdeel van de Minor Datavisualisatie binnen de opleiding **HBO-ICT van Zuyd Hogeschool**, in opdracht van het *Lectoraat Ondersteunende Technologie in de Zorg*. 

Patiënten die herstellen van een CVA (hersenbloeding of -infarct) trainen steeds vaker zelfstandig thuis met VR/XR-games en sensor-hesjes. Therapeuten misten echter een manier om de miljoenen ruwe datapunten uit deze sessies efficiënt te interpreteren. Onze opdracht was om een *Proof of Concept* dashboard te ontwerpen en ontwikkelen dat deze ruwe, vaak vervuilde hardware-data transformeert naar een rustige, direct leesbare interface voor de therapeut.

### 🎯 Doelen van het project
* **Data Transformatie:** Ruwe sensordata (Quaternions en Euler-hoeken) inlezen, opschonen en normaliseren via een client-side algoritme.
* **HCI & UI/UX Design:** Een interface ontwerpen gebaseerd op *Progressive Disclosure* en *Embodied Cognition*, zodat therapeuten binnen 5 seconden de status van een patiënt kunnen scannen (at-a-glance triage).
* **Data Physicalisation:** Abstracte Range of Motion (ROM) data visueel mappen op een anatomisch silhouet (Digital Twin concept).
* **Contextuele Integratie:** Objectieve bewegingsdata feilloos combineren met de subjectieve welzijnsdata van de patiënt (pijn, energie, tevredenheid).

### 🧩 Mijn bijdrage
In dit project heb ik me voornamelijk gericht op de brug tussen techniek en gebruikerservaring:
* **Data Visualisatie:** Het implementeren van **D3.js** om de opgeschoonde data dynamisch te renderen naar vloeiende lijngrafieken en interactieve UI-elementen.
* **Algoritmiek & Parsing:** Meewerken aan de logica om vervuilde hardware-data te fixen (zoals het schrijven van een *Euler Unwrapping* algoritme en *Baseline Normalisatie*).
* **UX/UI Design:** Het ontwerpen en verantwoorden van de modulaire 3-koloms architectuur in Figma, specifiek afgestemd op de cognitieve belasting van medisch personeel.
* **Documentatie:** Het theoretisch onderbouwen van onze gemaakte architectuur- en visualisatiekeuzes.

### 🛠️ Gebruikte tools
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Data Visualisatie:** D3.js
* **Prototyping & Design:** Figma
* **Version Control:** Git & GitHub

### 🧠 Wat ik heb geleerd
* **Complexe Data Handlen:** Het bouwen van een ETL-pipeline (Extract, Transform, Load) in de browser om onleesbare, asymmetrische hardware-data om te zetten in zuivere graden.
* **D3.js Beheersing:** De Document Object Model (DOM) direct manipuleren op basis van data-arrays in plaats van standaard grafiek-plugins te gebruiken.
* **HCI-Theorie in de Praktijk:** Leren hoe je *Hick's Law* en *Cognitive Overload* voorkomt in een medische applicatie waar de *time-to-insight* cruciaal is.
* **Stakeholder Management:** Ontwerpen itereren op basis van directe feedback van domeinexperts (onderzoekers en therapeuten).
