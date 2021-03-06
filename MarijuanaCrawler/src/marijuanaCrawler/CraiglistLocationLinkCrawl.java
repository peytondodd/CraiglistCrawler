package marijuanaCrawler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import commonlib.Globals;
import commonlib.Location;
import commonlib.NetworkingFunctions;

import dbconnection.DAOFactory;
import dbconnection.LocationLink;
import dbconnection.LocationLinkDAO;
import dbconnection.LocationLinkDAOJDBC;

public class CraiglistLocationLinkCrawl {
	private final int numRetryDownloadPage = 2;
	private final String startLink = "http://www.craigslist.org/about/sites";

	private Map<String, Location> linkToLocationMap = null;

	public CraiglistLocationLinkCrawl() {
		this.linkToLocationMap = new HashMap<String, Location>();
	}

	public Map<String, Location> getLinkToLocationMap() {
		return this.linkToLocationMap;
	}

	public boolean getLink() throws Exception {
		Document doc = NetworkingFunctions.downloadHtmlContentToDoc(this.startLink, this.numRetryDownloadPage);

		if (doc == null) {
			return false;
		}

		Elements countryElems = doc.select("div[class=colmask]");

		// Return if the page has no country div
		if (countryElems.size() == 0) {
			Globals.crawlerLogManager.writeLog("No country element");
			return false;
		}

		// US elem is the first one
		Element usCountryElem = countryElems.get(0);

		Elements stateNameElems = usCountryElem.select("h4");
		Elements stateCitiesElems = usCountryElem.select("ul");

		Globals.crawlerLogManager.writeLog("Found " + stateNameElems.size() + " state names and " + stateCitiesElems.size() + " state elems");

		if (stateNameElems.size() != stateCitiesElems.size())
			return false;

		if (stateNameElems.size() == 0)
			return false;

		int numStates = stateNameElems.size();

		// Iterate through each state listed in craiglist
		for (int i = 0; i < numStates; i++) {
			String stateName = stateNameElems.get(i).text().trim();
			Globals.crawlerLogManager.writeLog("State "+stateName + ":");

			Elements citiesElems = stateCitiesElems.get(i).select("li");
			int numCitiesInStates = citiesElems.size();
			
			Globals.crawlerLogManager.writeLog("Has "+numCitiesInStates+" cities/locations");
			// Iterate through each city of the current state
			for (int j = 0; j < numCitiesInStates; j++) {
				// TODO use city name when we have location based index
				String cityName = citiesElems.get(j).text().trim();
				String link = citiesElems.get(j).select("a").attr("href")
						.toString();
				Globals.crawlerLogManager.writeLog(cityName + ": " + link);
				
				Location loc =  new Location();
				loc.country = "US";
				loc.state = stateName;
				loc.city = cityName;
				
				this.linkToLocationMap.put(link, loc);
			}
		}

		return true;
	}

	public static void main(String[] args) throws Exception {
		CraiglistLocationLinkCrawl crawler = new CraiglistLocationLinkCrawl();

		// Fail to get the craiglist location links
		try {
            if (!crawler.getLink()) {
            	return;
            }
        } catch (IOException e) {
            Globals.crawlerLogManager.writeLog("Throw Exception " + e.getMessage());
            return;
        }

		Map<String, Location> linkToLocationMap = crawler.getLinkToLocationMap();

		if (linkToLocationMap == null) {
			return;
		}
		
		LocationLinkDAO locationLinkDAO = new LocationLinkDAOJDBC(DAOFactory.getInstance(
				Globals.username, Globals.password, Globals.server + Globals.database));
		
		for (Map.Entry<String, Location> entry : linkToLocationMap.entrySet()) {
			String link = entry.getKey();
			Location location = entry.getValue();
			
			LocationLink locationLink = new LocationLink();
			locationLink.setLink(link);
			locationLink.setCountry(location.country);
			locationLink.setState(location.state);
			locationLink.setCity(location.city);
			
			locationLinkDAO.create(locationLink);
		}
	}
}
