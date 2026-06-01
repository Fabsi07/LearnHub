# Algorithmus_neue_Formel

Algorithmus für Lernplan erstellen

Wichtige Unterscheidung die Lernplan Erstellung ist nur für Klausuren es wird später ein Feature geben welches für Hausaufgaben benutz werden kann

Der User muss eine Deadline angeben, an welchem Tag die Klausur ansteht.

\> 3 Monate 1.4 Sehr langer Zeitraum muss konstant wiederholen

2-3 Monate 1.1 Da der User noch lange Zeit hat und wiederholen muss

1-2 Monate 0.9 Der User hat den idealen Zeitraum

2-4Wochen 1.2 Der User muss sich ranhalten

< 2 Wochen 1.5 User hat nicht mehr viel zeit wird geprüft bei kritisch

D = Faktor der Deadline

Wie schwer ordnet der User die Klausur auf einer Skala von 1-5 (leicht-schwer).

1 = 0.8

2 = 1.0

3 = 1. 2

4 = 1.4

5 = 1.6

S = Schwierigkeitsfaktor

Der User schätzt seinen aktuellen Stand/Vorwissen zu dem Fach 1-5(wenig-viel)

1 = 1.5

2 = 1.3

3 = 1

4= 0.8

5 = 0.7

V = Wissensfaktor

Sollte später intern als Info mit rausgegeben werden. Das der User zb wenn er eine 5 an Vorwissen hat nicht so viel Zeit bei Grundlagen verbringt

Der User gibt ein Volumen an was er für die Klausur an Wissen erlangen muss. (zb. Seiten Anzahl von Folien)

0-50 Seiten = 0.7

50-100 = 1.0

100-150 = 1.3

\>150 = 1.6

Evtl bisschen längeres Grundlagen Fenster da der User viele Seiten behandeln muss.

20H Standard

Der User gibt an wie viele Credits die Klausur gibt.

1.	Credit = 0.2

2.	Credit = 0.4

3.	Credit = 0.6

4.	Credit = 0.8

5.	Credit = 1.0

6.	Credit = 1.2

7.	Credit = 1.4

8.	Credit = 1.6

9.	Credit = 1.8

10.	Credit = 2.0

C = Credit Faktor

Kritisch = Gesamtstunden/Tage bis zur Deadline > 3h ist dann ist kritisch und man muss den Lernplan umdenken

Der User sollte immer wieder ein Feedback an den Lernplan geben falls dieses mehrere Wochen schlecht ausfällt muss sich was ändern.

Falls der User sich zu inkonstant an den Lernplan hält ist es auch nicht gut evtl überfordert es ihn wenn er die Stunden Anzahl sieht

Lernstunden

Gesamtstunden =25 × D × ((S+W+V+C)/4)

Intensität

StundenProTag = Gesamtstunden / TageBisDeadline

Planwahl

StundenProTag ≤ 3

→ Normaler Lernplan

StundenProTag > 3

→ Kritischer Lernplan
